import { requireAuth, optionalAuth } from "./authMiddleware.js";

export { requireAuth as authenticate, optionalAuth };
export default requireAuth;
