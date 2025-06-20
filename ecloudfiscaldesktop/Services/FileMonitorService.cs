using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.IO;
using System.Linq;

namespace eCloudFiscalDesktop.Services
{

    private readonly List<string> _pendingFiles = new();
    private Timer? _uploadTimer;

    public void StartUploadScheduler()
    {
        _uploadTimer = new Timer(SendPendingFiles, null, TimeSpan.Zero, TimeSpan.FromMinutes(10));
    }

    private void ProcessFile(string path)
    {
        _pendingFiles.Add(path);
    }

    private void SendPendingFiles(object? state)
    {
        foreach (var file in _pendingFiles.ToList())
        {
            var success = EnviarParaBackend(file);
            if (success)
                _pendingFiles.Remove(file);
            else
                Console.WriteLine($"Erro ao enviar: {file}");
        }
    }
    public class FileMonitorService
    {
        private readonly List<FileSystemWatcher> _watchers = new();
        private readonly Action<string> _onFileDetected;

        public FileMonitorService(Action<string> onFileDetected)
        {
            _onFileDetected = onFileDetected;
        }

        public void StartWatching(IEnumerable<string> folders)
        {
            StopWatching();

            foreach (var folder in folders)
            {
                if (!Directory.Exists(folder))
                    continue;

                var watcher = new FileSystemWatcher(folder, "*.xml")
                {
                    EnableRaisingEvents = true,
                    IncludeSubdirectories = false,
                    NotifyFilter = NotifyFilters.FileName | NotifyFilters.LastWrite
                };

                watcher.Created += (_, e) => _onFileDetected?.Invoke(e.FullPath);
                watcher.Changed += (_, e) => _onFileDetected?.Invoke(e.FullPath);

                _watchers.Add(watcher);
            }
        }

        public void StopWatching()
        {
            foreach (var watcher in _watchers)
            {
                watcher.EnableRaisingEvents = false;
                watcher.Dispose();
            }

            _watchers.Clear();
        }
    }
}