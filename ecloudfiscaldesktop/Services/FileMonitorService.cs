using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace eCloudFiscalDesktop.Services
{
    public class FileMonitorService : IDisposable
    {
        private readonly List<FileSystemWatcher> _watchers = new();
        private readonly List<string> _pendingFiles = new();
        private Timer? _uploadTimer;

        private readonly Action<string> _onDetected;
        public FileMonitorService(Action<string> onDetected)
        {
            _onDetected = onDetected;
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

                watcher.Created += (_, e) => ProcessFile(e.FullPath);
                watcher.Changed += (_, e) => ProcessFile(e.FullPath);

                _watchers.Add(watcher);
            }

            StartUploadScheduler();
        }

        private void ProcessFile(string path)
        {
            if (!_pendingFiles.Contains(path))
            {
                Console.WriteLine($"📥 XML detectado: {path}");
                _pendingFiles.Add(path);
            }
        }

        private void StartUploadScheduler()
        {
            _uploadTimer = new Timer(SendPendingFiles, null, TimeSpan.Zero, TimeSpan.FromMinutes(10));
        }

        private async void SendPendingFiles(object? state)
        {
            foreach (var file in _pendingFiles.ToArray())
            {
                if (!File.Exists(file))
                    continue;

                bool success = await EnviarParaBackend(file);
                if (success)
                {
                    Console.WriteLine($"✅ Enviado: {Path.GetFileName(file)}");
                    _pendingFiles.Remove(file);
                }
                else
                {
                    Console.WriteLine($"❌ Falha ao enviar: {file}");
                }
            }
        }

        private async Task<bool> EnviarParaBackend(string filePath)
        {
            try
            {
                var client = new HttpClient();
                var backendUrl = "http://localhost:8080/api/files/upload";

                var payload = new
                {
                    user_id = "1", // ID fixo por enquanto
                    file_name = Path.GetFileName(filePath)
                };

                var json = JsonSerializer.Serialize(payload);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await client.PostAsync(backendUrl, content);
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"🚨 Erro: {ex.Message}");
                return false;
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
            _uploadTimer?.Dispose();
        }

        public void Dispose()
        {
            StopWatching();
        }
    }
}