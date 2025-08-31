package expo.modules.installedapps

import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.content.SharedPreferences
import android.net.TrafficStats
import android.app.usage.NetworkStats
import android.app.usage.NetworkStatsManager
import android.content.Context
import android.net.ConnectivityManager
import android.os.Process
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.net.InetAddress
import java.util.concurrent.TimeUnit

class InstalledAppsModule : Module() {
    private val PREFS_NAME = "AppLockPrefs"
    private val DANGEROUS_PERMISSIONS = listOf(
        "android.permission.CAMERA",
        "android.permission.READ_CONTACTS",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.RECORD_AUDIO"
    )

    private val networkStatsManager by lazy {
        appContext.reactContext?.getSystemService(Context.NETWORK_STATS_SERVICE) as NetworkStatsManager
    }

    private fun getSharedPreferences(): SharedPreferences {
        return appContext.reactContext?.getSharedPreferences(PREFS_NAME, 0)
            ?: throw Exception("Could not access SharedPreferences")
    }

    private fun assessRisk(permissions: Array<String>?): String {
        if (permissions == null) return "low"
        val dangerousCount = permissions.count { it in DANGEROUS_PERMISSIONS }
        return when {
            dangerousCount >= 3 -> "high"
            dangerousCount > 0 -> "medium"
            else -> "low"
        }
    }

    private fun getActiveNetworkConnections(uid: Int): List<String> {
        val connections = mutableListOf<String>()
        try {
            // Get network stats for the last hour
            val endTime = System.currentTimeMillis()
            val startTime = endTime - TimeUnit.HOURS.toMillis(1)

            val mobileSummary = networkStatsManager.querySummary(
                ConnectivityManager.TYPE_MOBILE,
                "",
                startTime,
                endTime
            )

            val wifiSummary = networkStatsManager.querySummary(
                ConnectivityManager.TYPE_WIFI,
                "",
                startTime,
                endTime
            )

            // Process mobile network stats
            var bucket = NetworkStats.Bucket()
            while (mobileSummary.hasNextBucket()) {
                mobileSummary.getNextBucket(bucket)
                if (bucket.uid == uid) {
                    val address = InetAddress.getByAddress(bucket.getBytes())
                    connections.add(address.hostAddress)
                }
            }

            // Process WiFi network stats
            while (wifiSummary.hasNextBucket()) {
                wifiSummary.getNextBucket(bucket)
                if (bucket.uid == uid) {
                    val address = InetAddress.getByAddress(bucket.getBytes())
                    connections.add(address.hostAddress)
                }
            }

            mobileSummary.close()
            wifiSummary.close()
        } catch (e: Exception) {
            println("Error getting network connections: ${e.message}")
        }
        return connections.distinct()
    }

    override fun definition() = ModuleDefinition {
        Name("InstalledApps")

        Function("getInstalledApps") {
            val pm = appContext.reactContext?.packageManager
                ?: throw Exception("PackageManager is null")
            val prefs = getSharedPreferences()

            val apps = pm.getInstalledPackages(PackageManager.GET_PERMISSIONS or PackageManager.GET_META_DATA)
            
            apps.filter { pkg ->
                pkg.applicationInfo.flags and ApplicationInfo.FLAG_SYSTEM == 0
            }.map { pkg ->
                val isLocked = prefs.getBoolean(pkg.packageName, false)
                val uid = pkg.applicationInfo.uid
                val networkConnections = getActiveNetworkConnections(uid)

                mapOf(
                    "appName" to pm.getApplicationLabel(pkg.applicationInfo).toString(),
                    "packageName" to pkg.packageName,
                    "versionName" to (pkg.versionName ?: "Unknown"),
                    "versionCode" to pkg.longVersionCode,
                    "permissions" to (pkg.requestedPermissions?.toList() ?: emptyList()),
                    "risk" to assessRisk(pkg.requestedPermissions),
                    "installTime" to pkg.firstInstallTime,
                    "lastUpdateTime" to pkg.lastUpdateTime,
                    "isLocked" to isLocked,
                    "networkConnections" to networkConnections
                )
            }
        }

        Function("isAppLocked") { packageName: String ->
            val prefs = getSharedPreferences()
            prefs.getBoolean(packageName, false)
        }

        Function("setAppLock") { packageName: String, locked: Boolean ->
            try {
                val prefs = getSharedPreferences()
                prefs.edit().putBoolean(packageName, locked).apply()
                true
            } catch (e: Exception) {
                false
            }
        }
    }
} 