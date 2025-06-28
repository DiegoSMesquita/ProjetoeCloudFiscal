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
using System.Linq;
using System.Text.RegularExpressions;

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
    public ReactiveCommand<Unit, Unit> ForgotPasswordCommand { get; }

    public LoginViewModel()
    {
        LoginCommand = ReactiveCommand.CreateFromTask(LoginAsync);
        ForgotPasswordCommand = ReactiveCommand.CreateFromTask(ForgotPasswordAsync);
    }

    private bool IsValidEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email)) return false;
        // Regex simples para validar e-mail
        return Regex.IsMatch(email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$");
    }

    private async Task LoginAsync()
    {
        if (!IsValidEmail(Email))
        {
            await ShowError("Por favor, preencha um e-mail válido.");
            return;
        }
        if (string.IsNullOrWhiteSpace(Password))
        {
            await ShowError("Por favor, preencha a senha.");
            return;
        }
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
                    if (Avalonia.Application.Current.ApplicationLifetime is IClassicDesktopStyleApplicationLifetime desktop)
                    {
                        var main = new MainWindow();
                        desktop.MainWindow = main;
                        main.Show();
                        foreach (var window in desktop.Windows.ToList())
                        {
                            if (window is LoginWindow loginWindow)
                            {
                                loginWindow.Close();
                                break;
                            }
                        }
                    }
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

    private async Task ForgotPasswordAsync()
    {
        await ShowError("Funcionalidade de redefinição de senha em breve.");
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
