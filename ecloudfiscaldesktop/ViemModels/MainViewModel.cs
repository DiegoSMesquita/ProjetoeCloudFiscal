using ReactiveUI;
using System.Collections.ObjectModel;
using System.Reactive;
using System.Threading.Tasks;
using Avalonia.Controls;
using eCloudFiscalDesktop.Services;
using System.IO;

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

        public ReactiveCommand<Unit, Unit> SelectFoldersCommand { get; }
        public ReactiveCommand<string, Unit> RetrySendCommand { get; }

        public MainViewModel()
        {
            _monitorService = new FileMonitorService(OnXmlDetected);

            SelectFoldersCommand = ReactiveCommand.CreateFromTask(SelectFoldersAsync);
            RetrySendCommand = ReactiveCommand.CreateFromTask<string>(RetrySendAsync);

            // Restaurar pastas (simulado)
            LoadMonitoredFolders();
            LoadErrorFiles();

            // Simula logs
            SentFiles.Add("NF-e_001.xml");
            ErrorFiles.Add("ERRO_.xml");
        }

        private async Task SelectFoldersAsync()
        {
            // Aqui entra a lógica real usando StorageProvider ou FilePicker
            // Simulação por enquanto
            await Task.Delay(200); // Simula carregamento
        }

        private async Task RetrySendAsync(string file)
        {
            if (ErrorFiles.Contains(file))
            {
                ErrorFiles.Remove(file);
                SentFiles.Add(file); // Simula sucesso
                await Task.Delay(100);
            }
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

        private async void OnXmlDetected(string fullPath)
        {
            // Aqui pode validar, enviar ao backend etc.
            if (Path.GetExtension(fullPath).ToLower() != ".xml")
                return;
            var nome = fullPath.GetFileName(fullPath);
            var xmlItem = new XmlFileModel(nome, "⏳ Enviando....");

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
            var path = "monitored_paths.txt";
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

        private void OnXmlDetected(string fullPath)
        {
            // Aqui pode validar, enviar ao backend etc.
            if (Path.GetExtension(fullPath).Equals(".xml", StringComparison.OrdinalIgnoreCase))
            {
                if (!SentFiles.Contains(Path.GetFileName(fullPath)))
                    SentFiles.Add(Path.GetFileName(fullPath));
            }
        }

        private void LoadMonitoredFolders()
        {
            var path = "monitored_paths.txt";
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

        private readonly ApiService _apiService()
        {
            _apiService = new ApiService();
        }

        private void LoadErrorFiles()
        {
            if (!File.Exists("error_files.txt"))
                return;
            var lines = File.ReadAllLines("error_files.txt");
            foreach (var line in lines)
            {
                ErrorFiles.Add(new Models.XmlFileModel(line, "❌ Erro"));
            }
        }
    }
}