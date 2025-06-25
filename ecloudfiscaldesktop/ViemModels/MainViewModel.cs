using ReactiveUI;
using System;
using System.Collections.ObjectModel;
using System.IO;
using System.Linq;
using System.Reactive;
using System.Threading.Tasks;
using Avalonia.Controls;
using eCloudFiscalDesktop.Models;
using eCloudFiscalDesktop.Services;

namespace eCloudFiscalDesktop.ViewModels
{
    public class MainViewModel : ViewModelBase
    {
        public ObservableCollection<XmlFileModel> SentFiles { get; } = new();
        public ObservableCollection<XmlFileModel> ErrorFiles { get; } = new();

        private bool _allowMultipleFolders = true;
        public bool AllowMultipleFolders
        {
            get => _allowMultipleFolders;
            set => this.RaiseAndSetIfChanged(ref _allowMultipleFolders, value);
        }

        public ObservableCollection<string> MonitoredFolders { get; } = new();
        private readonly FileMonitorService _monitorService;
        private readonly ApiService _apiService;

        public ReactiveCommand<Unit, Unit> SelectFoldersCommand { get; }
        public ReactiveCommand<string, Unit> RetrySendCommand { get; }

        public MainViewModel()
        {
            _monitorService = new FileMonitorService(OnXmlDetected);
            _apiService = new ApiService();

            SelectFoldersCommand = ReactiveCommand.CreateFromTask(SelectFoldersAsync);
            RetrySendCommand = ReactiveCommand.CreateFromTask<string>(RetrySendAsync);

            LoadMonitoredFolders();
            LoadErrorFiles();
        }

        private async Task SelectFoldersAsync()
        {
            var dialog = new OpenFolderDialog();
            var folder = await dialog.ShowAsync(new Window());

            if (!string.IsNullOrWhiteSpace(folder) && !MonitoredFolders.Contains(folder))
            {
                MonitoredFolders.Add(folder);
                SaveMonitoredFolders();
                _monitorService.StartWatching(MonitoredFolders);
            }
        }

        private async Task RetrySendAsync(string fileName)
        {
            var item = ErrorFiles.FirstOrDefault(f => f.Nome == fileName);
            if (item != null)
            {
                ErrorFiles.Remove(item);
                SentFiles.Add(item);

                await Task.Delay(100); // simula novo envio
            }
        }

        private async void OnXmlDetected(string fullPath)
        {
            if (!fullPath.EndsWith(".xml", StringComparison.OrdinalIgnoreCase))
                return;

            var fileName = Path.GetFileName(fullPath);
            var xmlItem = new XmlFileModel(fileName, "⏳ Enviando...");
            SentFiles.Add(xmlItem);

            var sucesso = await _apiService.EnviarXmlAsync(fullPath);

            if (sucesso)
            {
                xmlItem.Status = "✅ Enviado";
            }
            else
            {
                SentFiles.Remove(xmlItem);
                xmlItem.Status = "❌ Erro";
                ErrorFiles.Add(xmlItem);
                SaveErrorFiles();
            }
        }

        private void LoadMonitoredFolders()
        {
            const string path = "monitored_paths.txt";
            if (File.Exists(path))
            {
                var folders = File.ReadAllLines(path);
                foreach (var f in folders)
                    MonitoredFolders.Add(f);

                _monitorService.StartWatching(MonitoredFolders);
            }
        }

        private void SaveMonitoredFolders()
        {
            File.WriteAllLines("monitored_paths.txt", MonitoredFolders);
        }

        private void LoadErrorFiles()
        {
            const string path = "error_files.txt";
            if (!File.Exists(path)) return;

            var lines = File.ReadAllLines(path);
            foreach (var line in lines)
                ErrorFiles.Add(new XmlFileModel(line, "❌ Erro"));
        }

        private void SaveErrorFiles()
        {
            var list = ErrorFiles.Select(f => f.Nome).ToArray();
            File.WriteAllLines("error_files.txt", list);
        }
    }
}