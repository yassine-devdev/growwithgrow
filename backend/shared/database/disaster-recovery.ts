import { BackupService } from './backup-service';
import { BackupManager } from './backup-manager';
import { SQLDatabase } from "encore.dev/storage/sqldb";

export interface DisasterRecoveryConfig {
  rtoMinutes: number; // Recovery Time Objective in minutes
  rpoMinutes: number; // Recovery Point Objective in minutes
  backupFrequencyMinutes: number;
  ena