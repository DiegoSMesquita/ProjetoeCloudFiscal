using Avalonia;
using Avalonia.Controls.ApplicationLifetimes;
using Avalonia.Controls;
using Avalonia.Controls.Notifications;
using Avalonia.Markup.Xaml;
using Avalonia.Threading;
using eCloudFiscalDesktop.Views;
using eCloudFiscalDesktop.Helpers;

namespace eCloudFiscalDesktop
{
    public partial class App : Application
    {
        private TrayIcon? _trayIcon;

        public override void Initialize()
        {
            AvaloniaXamlLoader.Load(this);
        }

        public override void OnFrameworkInitializationCompleted()
        {
            if (Application.Current?.ApplicationLifetime is IClassicDesktopStyleApplicationLifetime desktop)
            // if (ApplicationLifetime is IClassicDesktopStyleApplicationLifetime desktop)
            {
                // Ativa inicialização com o sistema (Windows)
                AutoStartupHelper.EnableAutoStart("eCloudFiscalDesktop");

                var loginWindow = new LoginView();
                desktop.MainWindow = loginWindow;

                // Configura ícone na bandeja
                _trayIcon = new TrayIcon
                {
                    Icon = new WindowIcon("Assets/trayicon.ico"),
                    ToolTipText = "eCloudFiscal Monitor",
                    Menu = new NativeMenu()
                };

                var showItem = new NativeMenuItem("Mostrar Janela");
                showItem.Click += (_, _) => Dispatcher.UIThread.Post(() =>
                {
                    loginWindow.Show();
                    loginWindow.WindowState = WindowState.Normal;
                });

                var exitItem = new NativeMenuItem("Sair");
                exitItem.Click += (_, _) => desktop.Shutdown();

                _trayIcon.Menu.Items.Add(showItem);
                _trayIcon.Menu.Items.Add(exitItem);

                _trayIcon.IsVisible = true;

                // Impede o fechamento da janela (apenas oculta)
                loginWindow.Closing += (s, e) =>
                {
                    e.Cancel = true;
                    loginWindow.Hide();
                };

                loginWindow.Show();
            }

            base.OnFrameworkInitializationCompleted();
        }
    }
}