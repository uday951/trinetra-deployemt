import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { ArrowLeft, Zap, Trash2, Cpu, Battery, HardDrive, Wifi, Thermometer, Activity } from 'lucide-react-native';
import { router } from 'expo-router';
import SimpleDeviceService, { SimpleDeviceMetrics } from '../services/simpleDeviceService';
// import NativeDeviceModule from '../services/nativeDeviceModule';

interface OptimizationTask {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  estimatedTime: number;
  estimatedSavings: string;
  action: () => Promise<any>;
}

export default function DeviceOptimizationScreen() {
  const [metrics, setMetrics] = useState<SimpleDeviceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState<string | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [realTimeData, setRealTimeData] = useState<any>(null);

  const optimizationTasks: OptimizationTask[] = [
    {
      id: 'cache',
      name: 'Clear System Cache',
      description: 'Remove temporary files and cached data',
      icon: Trash2,
      color: '#ff6b6b',
      estimatedTime: 30,
      estimatedSavings: '200-500 MB',
      action: () => SimpleDeviceService.clearCache()
    },
    {
      id: 'memory',
      name: 'Boost Memory',
      description: 'Free up RAM by closing unused apps',
      icon: Cpu,
      color: '#4ecdc4',
      estimatedTime: 15,
      estimatedSavings: '500MB-2GB',
      action: () => SimpleDeviceService.freeMemory()
    },
    {
      id: 'background',
      name: 'Kill Background Apps',
      description: 'Stop unnecessary background processes',
      icon: Activity,
      color: '#45b7d1',
      estimatedTime: 10,
      estimatedSavings: '5-20 apps',
      action: () => SimpleDeviceService.killBackgroundApps()
    },
    {
      id: 'temp',
      name: 'Clean Temp Files',
      description: 'Remove temporary and log files',
      icon: HardDrive,
      color: '#f9ca24',
      estimatedTime: 45,
      estimatedSavings: '50-200 MB',
      action: () => SimpleDeviceService.cleanTempFiles()
    },
    {
      id: 'battery',
      name: 'Optimize Battery',
      description: 'Adjust settings for better battery life',
      icon: Battery,
      color: '#6c5ce7',
      estimatedTime: 60,
      estimatedSavings: '20-30% longer',
      action: () => SimpleDeviceService.optimizeBattery()
    },
    {
      id: 'storage',
      name: 'Defragment Storage',
      description: 'Optimize file system for better performance',
      icon: HardDrive,
      color: '#a29bfe',
      estimatedTime: 120,
      estimatedSavings: '10-15% faster',
      action: () => SimpleDeviceService.defragmentStorage()
    }
  ];

  useEffect(() => {
    loadDeviceMetrics();
    startRealTimeMonitoring();
  }, []);

  const loadDeviceMetrics = async () => {
    try {
      const deviceMetrics = await SimpleDeviceService.getDeviceMetrics();
      setMetrics(deviceMetrics);
    } catch (error) {
      console.error('Error loading device metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const startRealTimeMonitoring = async () => {
    // Initial load only - no auto-refresh
    try {
      const newMetrics = await SimpleDeviceService.getDeviceMetrics();
      setRealTimeData({
        timestamp: Date.now(),
        battery: {
          level: newMetrics.battery.level,
          temperature: newMetrics.battery.temperature,
          isCharging: newMetrics.battery.isCharging
        },
        cpu: {
          usage: newMetrics.cpu.usage,
          temperature: newMetrics.cpu.temperature
        },
        memory: {
          available: newMetrics.memory.available,
          pressure: newMetrics.memory.pressure
        }
      });
    } catch (error) {
      console.error('Error in monitoring:', error);
    }
  };

  const runOptimizationTask = async (task: OptimizationTask) => {
    setOptimizing(task.id);
    try {
      const result = await task.action();
      
      let message = '';
      if (task.id === 'cache' || task.id === 'temp' || task.id === 'memory') {
        message = `Freed ${SimpleDeviceService.formatBytes(result)}`;
      } else if (task.id === 'background') {
        message = `Killed ${result} background processes`;
      } else if (task.id === 'battery' || task.id === 'storage') {
        message = result ? 'Optimization completed successfully' : 'Optimization failed';
      }
      
      Alert.alert('Task Completed', `${task.name}: ${message}`);
      setCompletedTasks(prev => new Set([...prev, task.id]));
      
      // Refresh metrics after optimization
      await loadDeviceMetrics();
    } catch (error) {
      console.error(`Error running ${task.name}:`, error);
      Alert.alert('Error', `Failed to complete ${task.name}`);
    } finally {
      setOptimizing(null);
    }
  };

  const runAllOptimizations = async () => {
    setOptimizing('all');
    try {
      const results = [];
      for (const task of optimizationTasks) {
        if (!completedTasks.has(task.id)) {
          const result = await task.action();
          results.push({ task: task.name, result });
        }
      }
      
      Alert.alert(
        'All Optimizations Complete',
        results.map(r => `✅ ${r.task}`).join('\n')
      );
      
      setCompletedTasks(new Set(optimizationTasks.map(t => t.id)));
      await loadDeviceMetrics();
    } catch (error) {
      console.error('Error running all optimizations:', error);
      Alert.alert('Error', 'Some optimizations failed to complete');
    } finally {
      setOptimizing(null);
    }
  };

  if (loading || !metrics) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#4169E1" />
        <Text style={styles.loadingText}>Loading optimization tools...</Text>
      </View>
    );
  }

  const healthScore = SimpleDeviceService.getHealthScore(metrics);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Device Optimization</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Current Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>Current Status</Text>
            <View style={[styles.healthBadge, { 
              backgroundColor: healthScore > 80 ? '#e6f7eb' : healthScore > 60 ? '#fff3cd' : '#ffebee' 
            }]}>
              <Text style={[styles.healthText, { 
                color: healthScore > 80 ? '#2e7d32' : healthScore > 60 ? '#856404' : '#d32f2f' 
              }]}>
                {healthScore}% Health
              </Text>
            </View>
          </View>
          
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Battery size={20} color={metrics.battery.level < 20 ? '#e53e3e' : '#4169E1'} />
              <Text style={styles.metricValue}>{metrics.battery.level}%</Text>
              <Text style={styles.metricLabel}>Battery</Text>
              {realTimeData && (
                <Text style={styles.realTimeValue}>
                  {realTimeData.battery.temperature.toFixed(1)}°C
                </Text>
              )}
            </View>
            
            <View style={styles.metricItem}>
              <Cpu size={20} color={metrics.cpu.usage > 80 ? '#e53e3e' : '#4169E1'} />
              <Text style={styles.metricValue}>{metrics.cpu.usage}%</Text>
              <Text style={styles.metricLabel}>CPU</Text>
              {realTimeData && (
                <Text style={styles.realTimeValue}>
                  {realTimeData.cpu.usage.toFixed(0)}%
                </Text>
              )}
            </View>
            
            <View style={styles.metricItem}>
              <HardDrive size={20} color="#4169E1" />
              <Text style={styles.metricValue}>
                {SimpleDeviceService.formatBytes(metrics.memory.available)}
              </Text>
              <Text style={styles.metricLabel}>Free RAM</Text>
              {realTimeData && (
                <Text style={[styles.realTimeValue, {
                  color: realTimeData.memory.pressure === 'high' ? '#e53e3e' : '#4169E1'
                }]}>
                  {realTimeData.memory.pressure}
                </Text>
              )}
            </View>
            
            <View style={styles.metricItem}>
              <Thermometer size={20} color={metrics.cpu.temperature > 60 ? '#e53e3e' : '#4169E1'} />
              <Text style={styles.metricValue}>{metrics.cpu.temperature}°C</Text>
              <Text style={styles.metricLabel}>Temp</Text>
              {realTimeData && (
                <Text style={styles.realTimeValue}>
                  {realTimeData.cpu.temperature.toFixed(0)}°C
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsCard}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity 
            style={[styles.optimizeAllButton, optimizing === 'all' && styles.optimizeAllButtonDisabled]}
            onPress={runAllOptimizations}
            disabled={optimizing !== null}
          >
            <Zap size={20} color="#fff" />
            <Text style={styles.optimizeAllButtonText}>
              {optimizing === 'all' ? 'Optimizing All...' : 'Optimize Everything'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Optimization Tasks */}
        <View style={styles.tasksSection}>
          <Text style={styles.sectionTitle}>Optimization Tasks</Text>
          
          {optimizationTasks.map((task) => {
            const isCompleted = completedTasks.has(task.id);
            const isRunning = optimizing === task.id;
            const IconComponent = task.icon;
            
            return (
              <TouchableOpacity
                key={task.id}
                style={[
                  styles.taskCard,
                  isCompleted && styles.taskCardCompleted,
                  isRunning && styles.taskCardRunning
                ]}
                onPress={() => runOptimizationTask(task)}
                disabled={optimizing !== null || isCompleted}
              >
                <View style={styles.taskLeft}>
                  <View style={[styles.taskIcon, { backgroundColor: task.color + '20' }]}>
                    <IconComponent size={24} color={task.color} />
                  </View>
                  <View style={styles.taskInfo}>
                    <Text style={styles.taskName}>{task.name}</Text>
                    <Text style={styles.taskDescription}>{task.description}</Text>
                    <View style={styles.taskMeta}>
                      <Text style={styles.taskTime}>~{task.estimatedTime}s</Text>
                      <Text style={styles.taskSavings}>Saves: {task.estimatedSavings}</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.taskRight}>
                  {isRunning && <ActivityIndicator size="small" color={task.color} />}
                  {isCompleted && (
                    <View style={styles.completedBadge}>
                      <Text style={styles.completedText}>✓</Text>
                    </View>
                  )}
                  {!isRunning && !isCompleted && (
                    <View style={[styles.runButton, { backgroundColor: task.color }]}>
                      <Text style={styles.runButtonText}>Run</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* System Information */}
        <View style={styles.systemInfoCard}>
          <Text style={styles.sectionTitle}>System Information</Text>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Uptime</Text>
              <Text style={styles.infoValue}>
                {SimpleDeviceService.formatTime(metrics.system.uptime)}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Architecture</Text>
              <Text style={styles.infoValue}>{metrics.cpu.architecture}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>CPU Cores</Text>
              <Text style={styles.infoValue}>{metrics.cpu.cores}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Network</Text>
              <Text style={styles.infoValue}>
                {metrics.network.type} • {metrics.network.strength}%
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Last Optimized</Text>
              <Text style={styles.infoValue}>
                {metrics.system.lastOptimized === 'Never' 
                  ? 'Never' 
                  : new Date(metrics.system.lastOptimized).toLocaleDateString()
                }
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Storage</Text>
              <Text style={styles.infoValue}>
                {SimpleDeviceService.formatBytes(metrics.storage.internal.available)} free
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  healthBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  healthText: {
    fontSize: 14,
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
  },
  realTimeValue: {
    fontSize: 10,
    color: '#4169E1',
    marginTop: 2,
  },
  quickActionsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  optimizeAllButton: {
    backgroundColor: '#4169E1',
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optimizeAllButtonDisabled: {
    backgroundColor: '#a0aec0',
  },
  optimizeAllButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  tasksSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  taskCardCompleted: {
    backgroundColor: '#f8f9fa',
    opacity: 0.7,
  },
  taskCardRunning: {
    borderColor: '#4169E1',
    borderWidth: 2,
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  taskIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  taskMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  taskTime: {
    fontSize: 12,
    color: '#4169E1',
  },
  taskSavings: {
    fontSize: 12,
    color: '#2e7d32',
  },
  taskRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2e7d32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  runButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  runButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  systemInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});