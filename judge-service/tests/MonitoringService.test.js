import { jest, describe, test, expect, beforeEach } from "@jest/globals";
import { MonitoringService } from "../src/services/MonitoringService.js";

describe("MonitoringService Unit Tests", () => {
  let monitoringService;

  beforeEach(() => {
    monitoringService = new MonitoringService();
  });

  test("1. Records execution times and computes sliding window average execution time", () => {
    monitoringService.recordExecution(100);
    monitoringService.recordExecution(200);
    monitoringService.recordExecution(300);

    expect(monitoringService.totalExecutions).toBe(3);
    expect(monitoringService.getAverageExecutionTimeMs()).toBe(200);
  });

  test("2. Collects process and system Memory Usage metrics", () => {
    const memory = monitoringService.getMemoryUsage();

    expect(memory).toHaveProperty("processHeapUsedMb");
    expect(memory).toHaveProperty("processRssMb");
    expect(memory).toHaveProperty("systemTotalMemoryMb");
    expect(memory).toHaveProperty("systemFreeMemoryMb");
    expect(memory).toHaveProperty("memoryUsagePercent");
    expect(typeof memory.processHeapUsedMb).toBe("number");
  });

  test("3. Collects system CPU Usage metrics", () => {
    const cpu = monitoringService.getCpuUsage();

    expect(cpu).toHaveProperty("cores");
    expect(cpu).toHaveProperty("loadAverage1m");
    expect(cpu).toHaveProperty("processCpuUserMs");
    expect(typeof cpu.cores).toBe("number");
    expect(cpu.cores).toBeGreaterThan(0);
  });

  test("4. Evaluates Worker Health state", () => {
    const worker = monitoringService.getWorkerHealth();

    expect(worker.status).toBe("DEGRADED");
    expect(worker.isListening).toBe(false);
    expect(worker.uptimeSeconds).toBeGreaterThanOrEqual(0);
    expect(worker.nodeVersion).toBe(process.version);
  });

  test("5. Generates full GET /health report containing all required tracking metrics", async () => {
    jest.spyOn(monitoringService, "getQueueStatus").mockResolvedValue({
      queueName: "judgo-execution",
      length: 2,
      active: 1,
      failed: 0,
      consumers: 1,
      isOnline: true
    });
    jest.spyOn(monitoringService, "getContainerStatus").mockResolvedValue({
      dockerAvailable: true,
      runningContainersCount: 1
    });
    monitoringService.recordExecution(45);
    const report = await monitoringService.getHealthReport();

    expect(report).toHaveProperty("status");
    expect(report).toHaveProperty("timestamp");
    expect(report).toHaveProperty("queue");
    expect(report).toHaveProperty("sandbox");
    expect(report).toHaveProperty("metrics");
    expect(report).toHaveProperty("system");

    // Check specific required metrics:
    // 1. Queue length
    expect(report.queue).toHaveProperty("length");
    // 2. Average execution time
    expect(report.metrics).toHaveProperty("averageExecutionTimeMs");
    // 3. Running containers
    expect(report.sandbox).toHaveProperty("runningContainers");
    // 4. Worker health
    expect(report.worker).toHaveProperty("status");
    // 5. Memory usage
    expect(report.system).toHaveProperty("memory");
    // 6. CPU usage
    expect(report.system).toHaveProperty("cpu");
  });
});
