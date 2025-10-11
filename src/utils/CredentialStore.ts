// ------------------------------------------------------------------------------------------------------------
// In-Memory Credentials Store
// ------------------------------------------------------------------------------------------------------------
interface CredentialEntry {
  user: string;
  pwd: string;
  token: string;
}

class CredentialsStore {
  private store: Map<string, CredentialEntry> = new Map();

  /**
   * Store credentials for a specific PLC IP address
   */
  set(ipAddress: string, credentials: CredentialEntry): void {
    this.store.set(ipAddress, credentials);
  }

  /**
   * Retrieve credentials by PLC IP address
   */
  get(ipAddress: string): CredentialEntry | undefined {
    return this.store.get(ipAddress);
  }

  /**
   * Remove credentials for a specific PLC IP address
   */
  delete(ipAddress: string): boolean {
    return this.store.delete(ipAddress);
  }

  /**
   * Check if credentials exist for a specific IP address
   */
  has(ipAddress: string): boolean {
    return this.store.has(ipAddress);
  }

  /**
   * Clear all stored credentials
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Get all stored IP addresses
   */
  getIpAddresses(): string[] {
    return Array.from(this.store.keys());
  }

  /**
   * Get total number of stored credentials
   */
  size(): number {
    return this.store.size;
  }
}

// Export singleton instance
export const credentialsStore = new CredentialsStore();