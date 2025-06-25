using Microsoft.Win32;
using System;
using System.Dynamic;
using System.Runtime.InteropServices;

namespace eCloudFiscalDesktop.Helpers
{
    public static class AutoStartupHelper
    {
        public static void EnableAutoStart(string appName)
        {
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            {
                string runKey = @"Software\Microsoft\Windows\CurrentVersion\Run";
                using var key = Registry.CurrentUser.OpenSubKey(runKey, true);
                var exePath = System.Diagnostics.Process.GetCurrentProcess().MainModule.FileName;
                key?.SetValue(appName, $"\"{exePath}\"");
            }
        }

        public static void DisableAutoStart(string appName)
        {
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            {
                string runKey = @"Software\Microsoft\Windows\CurrentVersion\Run";
                using var key = Registry.CurrentUser.OpenSubKey(runKey, true);
                key?.DeleteValue(appName, false);
            }
        }
    }
}