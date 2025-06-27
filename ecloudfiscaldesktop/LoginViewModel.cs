using ReactiveUI;
using System.Net.Http;
using System.Net.Http.Json;
using System.Reactive;
using System.Threading.Tasks;
using Avalonia.Controls;
using Avalonia.Threading;
using Avalonia;
using Avalonia.Controls.ApplicationLifetimes;
using System;

namespace eCloudFiscalDesktop;

public class LoginViewModel : ReactiveObject
{
    private string _email = string.Empty;
    public string Email
    {
        get => _email;
        set => this.RaiseAndSetIfChanged(ref _email, value);
    }

    private string _password = string.Empty;
    public string Password
    {
        get => _password;
        set => this.RaiseAndSetIfChanged(ref _password, value);
    }

    public ReactiveCommand<Unit, Unit> LoginCommand { get; }

    public LoginViewModel()
    {
        LoginCommand = ReactiveCommand.CreateFromTask(LoginAsync);
    }

    private async Task LoginAsync()
    {
        try
        {
            using var client = new HttpClient();
            var url = "http://localhost:8080/api/login";
            var payload = new { email = Email, password = Password };
            var response = await client.PostAsJsonAsync(url, payload);

            if (response.IsSuccessStatusCode)
            {
                await Dispatcher.UIThread.InvokeAsync(() =>
                {
                    var main = new MainWindow();
                    main.Show();
                    CloseLoginWindow();
                });
            }
            else
            {
                await ShowError("Email ou senha inválidos.");
            }
        }
        catch (Exception ex)
        {
            await ShowError($"Erro: {ex.Message}");
        }
    }

    private void CloseLoginWindow()
    {
        if (Avalonia.Application.Current.ApplicationLifetime is IClassicDesktopStyleApplicationLifetime desktop)
        {
            foreach (var window in desktop.Windows)
            {
                if (window is LoginWindow loginWindow)
                {
                    loginWindow.Close();
                    break;
                }
            }
        }
    }

    private async Task ShowError(string message)
    {
        await Dispatcher.UIThread.InvokeAsync(async () =>
        {
            var dlg = new Window
            {
                Title = "Erro",
                Width = 300,
                Height = 150,
                Content = new StackPanel
                {
                    Children =
                    {
                        new TextBlock { Text = message, Margin = new Thickness(10) },
                        new Button
                        {
                            Content = "OK",
                            HorizontalAlignment = Avalonia.Layout.HorizontalAlignment.Right,
                            Margin = new Thickness(10),
                        }
                    }
                }
            };
            if (dlg.Content is StackPanel sp && sp.Children[1] is Button btn)
            {
                btn.Click += (_, _) => dlg.Close();
            }
            await dlg.ShowDialog(GetActiveWindow());
        });
    }

    private Window? GetActiveWindow()
    {
        if (Avalonia.Application.Current.ApplicationLifetime is IClassicDesktopStyleApplicationLifetime desktop)
        {
            foreach (var window in desktop.Windows)
            {
                if (window.IsActive)
                    return window;
            }
        }
        return null;
    }
}
