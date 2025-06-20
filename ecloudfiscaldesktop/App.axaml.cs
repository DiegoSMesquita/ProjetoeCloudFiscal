using Avalonia;
using Avalonia.Controls.ApplicationLifetimes;
using Avalonia.Markup.Xaml;
using Avalonia.Controls;
using Avalonia.Controls.Notifications;
using Avalonia.Threading;
using eCloudFiscalDesktop.Views;
using eCloudFiscalDesktop.Helpers;

namespace eCloudFiscalDesktop
{
    public partial class App : Application
    {
        public override void Initialize()
        {
            AvaloniaXamlLoader.Load(this);
        }

        public override void OnFrameworkInitializationCompleted()
        {
            if (ApplicationLifetime is IClassicDesktopStyleApplicationLifetime desktop)
            {
                // Ativa inicialização com o sistema (Apenas no WINDOWS)
                AutoStartupHelper.EnableAutoStart("eCloudFiscalDesktop");

                var loginWindow = new LoginView();
                desktop.MainWindow = loginWindow;
            }

            base.OnFrameworkInitializationCompleted();
        }

        private TrayIcon? _trayIcon;
        // Referência ao AppLifetime
        // Referência ao AppLifetime
if (ApplicationLifetime is IClassicDesktopStyleApplicationLifetime desktop)
{
    AutoStartupHelper.EnableAutoStart("eCloudFiscalDesktop");

    var loginWindow = new LoginView();
        desktop.MainWindow = loginWindow;

    // ✅ Adiciona o ícone da bandeja
    _trayIcon = new TrayIcon
    {
        Icon = new WindowIcon("Assets/trayicon.ico"), // coloque um ícone .ico válido em Assets/
        ToolTipText = "eCloudFiscal Monitor"
    };

    // Adiciona menu da bandeja
    _trayIcon.Menu = new NativeMenu();

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

            // ⚠️ Intercepta tentativa de fechar e esconde
            loginWindow.Closing += (s, e) =>
            {
            e.Cancel = true;
            loginWindow.Hide();
            };

loginWindow.Show();
            }
        }
    }