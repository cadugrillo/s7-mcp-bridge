/**
 * JSON RPC Request ID Generator
 * Provides unique, auto-incrementing IDs for JSON RPC requests
 *
 * This singleton class ensures each JSON RPC request gets a unique ID
 * to properly track requests and responses according to the JSON RPC 2.0 specification.
 */
class JsonRpcIdGenerator {
  private currentId: number = 0;
  private readonly maxId: number = Number.MAX_SAFE_INTEGER;

  /**
   * Get the next available ID
   * @returns A unique ID number
   */
  getNextId(): number {
    this.currentId = (this.currentId % this.maxId) + 1;
    return this.currentId;
  }

  /**
   * Reset the counter (useful for testing)
   */
  reset(): void {
    this.currentId = 0;
  }

  /**
   * Get current ID without incrementing
   */
  getCurrentId(): number {
    return this.currentId;
  }
}

// Export a singleton instance
export const jsonRpcIdGenerator = new JsonRpcIdGenerator();
