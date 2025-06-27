using ReactiveUI;
using System.Collections.ObjectModel;
using System.Reactive;

namespace eCloudFiscalDesktop;

public class MainViewModel : ReactiveObject
{
    public ObservableCollection<string> MonitoredFolders { get; } = new();
    public ObservableCollection<string> SentFiles { get; } = new();
    public ObservableCollection<string> PendingFiles { get; } = new();

    public ReactiveCommand<Unit, Unit> SelectFoldersCommand { get; }
    public ReactiveCommand<Unit, Unit> StartMonitoringCommand { get; }
    public ReactiveCommand<Unit, Unit> ForceSendCommand { get; }

    public MainViewModel()
    {
        SelectFoldersCommand = ReactiveCommand.Create(() => { });
        StartMonitoringCommand = ReactiveCommand.Create(() => { });
        ForceSendCommand = ReactiveCommand.Create(() => { });
    }
}
