import os from "os";
import { dockerService } from "./DockerService.js";
import { queueProducer } from "../queue/producer.js";
import { queueConsumer } from "../queue/consumer.js";

/**
 * MonitoringService - Real-time System Metrics & Health Monitoring Service
 * 
 * Tracks:
 * 1. Queue length & RabbitMQ connection status
 * 2. Average execution time (sliding window)
 * 3. Running Docker sandbox containers
 * 4. Worker health & listener state
 * 5. Memory usage (Heap used, RSS, System Free/Total Memory)
 * 6. CPU usage (Cores, Load Average 1m/5m/15m, Process CPU time)
 * 
 * Generates health endpoint: GET /health
 */
export class MonitoringService {
  constructor() {
    this.startTime = Date.now();
    this.executionHistory = []; // Stores up to 50 recent execution times in ms
    this.totalExecutions = 0;
  }

  /**
   * Tracks an execution metric (time in ms)
   * @param {number} executionTimeMs
   */
  recordExecution(executionTimeMs) {
    if (typeof executionTimeMs === "number" && executionTimeMs >= 0) {
      this.totalExecutions++;
      this.executionHistory.push(executionTimeMs);
      if (this.executionHistory.length > 50) {
        this.executionHistory.shift();
      }
    }
  }

  /**
   * Calculates sliding window average execution time
   * @returns {number} Average execution time in ms (rounded to 1 decimal place)
   */
  getAverageExecutionTimeMs() {
    if (this.executionHistory.length === 0) return 0;
    const sum = this.executionHistory.reduce((a, b) => a + b, 0);
    return Number((sum / this.executionHistory.length).toFixed(1));
  }

  /**
   * Track 1: Queue Length & Connection Status
   * @returns {Promise<{ queueName: string, length: number, consumers: number, isOnline: boolean }>}
   */
  async getQueueStatus() {
    try {
      const channel = await queueProducer.connect();
      if (channel) {
        const queueInfo = await channel.checkQueue("judge_queue");
        return {
          queueName: "judge_queue",
          length: queueInfo.messageCount || 0,
          consumers: queueInfo.consumerCount || 0,
          isOnline: true
        };
      }
    } catch (err) {
      // Fallback mode if RabbitMQ offline
    }

    return {
      queueName: "judge_queue",
      length: 0,
      consumers: queueConsumer.isListening ? 1 : 0,
      isOnline: false
    };
  }

  /**
   * Track 3: Running Containers Count
   * @returns {Promise<{ dockerAvailable: boolean, runningContainersCount: number }>}
   */
  async getContainerStatus() {
    try {
      const isAvailable = await dockerService.isDockerAvailable();
      if (!isAvailable) {
        return { dockerAvailable: false, runningContainersCount: 0 };
      }

      const containers = await dockerService.docker.listContainers({ all: false });
      const sandboxContainers = containers.filter((c) =>
        (c.Image && c.Image.includes("sandbox")) ||
        (c.Names && c.Names.some((n) => n.includes("sandbox")))
      );

      return {
        dockerAvailable: true,
        runningContainersCount: sandboxContainers.length
      };
    } catch (err) {
      return { dockerAvailable: false, runningContainersCount: 0 };
    }
  }

  /**
   * Track 5: Memory Usage (Process Heap, RSS, System Total/Free)
   * @returns {Object}
   */
  getMemoryUsage() {
    const procMem = process.memoryUsage();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    return {
      processHeapUsedMb: Number((procMem.heapUsed / (1024 * 1024)).toFixed(1)),
      processHeapTotalMb: Number((procMem.heapTotal / (1024 * 1024)).toFixed(1)),
      processRssMb: Number((procMem.rss / (1024 * 1024)).toFixed(1)),
      systemTotalMemoryMb: Number((totalMem / (1024 * 1024)).toFixed(1)),
      systemFreeMemoryMb: Number((freeMem / (1024 * 1024)).toFixed(1)),
      systemUsedMemoryMb: Number((usedMem / (1024 * 1024)).toFixed(1)),
      memoryUsagePercent: `${((usedMem / totalMem) * 100).toFixed(1)}%`
    };
  }

  /**
   * Track 6: CPU Usage (Cores, Load Average 1m/5m/15m, Process CPU time)
   * @returns {Object}
   */
  getCpuUsage() {
    const cpus = os.cpus();
    const loadAvg = os.loadavg();
    const cpuUsage = process.cpuUsage();

    return {
      cores: cpus.length,
      model: cpus[0]?.model || "System Processor",
      loadAverage1m: Number((loadAvg[0] || 0).toFixed(2)),
      loadAverage5m: Number((loadAvg[1] || 0).toFixed(2)),
      loadAverage15m: Number((loadAvg[2] || 0).toFixed(2)),
      processCpuUserMs: Math.round(cpuUsage.user / 1000),
      processCpuSystemMs: Math.round(cpuUsage.system / 1000)
    };
  }

  /**
   * Track 4: Worker Health & Listener Status
   * @returns {Object}
   */
  getWorkerHealth() {
    return {
      status: "HEALTHY",
      isListening: queueConsumer.isListening,
      uptimeSeconds: Number(((Date.now() - this.startTime) / 1000).toFixed(1)),
      nodeVersion: process.version,
      platform: process.platform
    };
  }

  /**
   * Generates GET /health Endpoint Response Payload
   * @returns {Promise<Object>} Health & Metrics JSON Payload
   */
  async getHealthReport() {
    const queue = await this.getQueueStatus();
    const sandbox = await this.getContainerStatus();
    const memory = this.getMemoryUsage();
    const cpu = this.getCpuUsage();
    const worker = this.getWorkerHealth();

    const isHealthy = sandbox.dockerAvailable || queue.isOnline || worker.isListening;

    return {
      status: isHealthy ? "HEALTHY" : "DEGRADED",
      timestamp: new Date().toISOString(),
      uptimeSeconds: worker.uptimeSeconds,
      worker: {
        status: worker.status,
        isListening: worker.isListening,
        nodeVersion: worker.nodeVersion,
        platform: worker.platform
      },
      queue: {
        name: queue.queueName,
        length: queue.length,
        consumers: queue.consumers,
        isOnline: queue.isOnline
      },
      sandbox: {
        dockerAvailable: sandbox.dockerAvailable,
        runningContainers: sandbox.runningContainersCount
      },
      metrics: {
        totalExecutions: this.totalExecutions,
        averageExecutionTimeMs: this.getAverageExecutionTimeMs(),
        recentExecutionTimesMs: this.executionHistory.slice(-10)
      },
      system: {
        memory,
        cpu
      }
    };
  }
}

// Export singleton instance
export const monitoringService = new MonitoringService();

// Default export for import flexibility
export default monitoringService;
