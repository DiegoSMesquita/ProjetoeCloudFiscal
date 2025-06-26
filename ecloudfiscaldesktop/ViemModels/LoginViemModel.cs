using ReactiveUI;
using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Reactive;
using System.Threading.Tasks;
using Avalonia.Controls;
using Avalonia.Threading;
using eCloudFiscalDesktop.Views;
using Newtonsoft.Json;
using Avalonia.Controls.ApplicationLifetimes;
using Avalonia;

namespace eCloudFiscalDesktop.ViewModels
{
    public class LoginViewModel : ViewModelBase
    {
        private string _email = string.Empty;
        private string _password = string.Empty;

        public string Email
        {
            get => _email;
            set => this.RaiseAndSetIfChanged(ref _email, value);
        }

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
            using var client = new HttpClient();
            var url = "http://localhost:8080/api/login";

            var payload = new
            {
                email = Email,
                password = Password
            };

            try
            {
                var response = await client.PostAsJsonAsync(url, payload);

                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    var result = JsonConvert.DeserializeObject<LoginResponse>(content);

                    // Abrir tela principal
                    Dispatcher.UIThread.Post(() =>
                    {
                        var main = new MainView();
                        main.Show();

                        if (Avalonia.Application.Current.ApplicationLifetime is IClassicDesktopStyleApplicationLifetime app)
                        {
                            app.MainWindow?.Close(); // Fecha janela de login
                            app.MainWindow = main;
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
                await ShowError($"Erro na conexão: {ex.Message}");
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
                                Command = ReactiveCommand.Create(() =>
                                {
                                    dlg.Close();
                                })
                            }
                        }
                    }
                };

                await dlg.ShowDialog((Window?)App.Current?.ApplicationLifetime switch
                {
                    IClassicDesktopStyleApplicationLifetime d => d.MainWindow,
                    _ => null
                });
            });
        }

        private class LoginResponse
        {
            [JsonProperty("token")]
            public string Token { get; set; } = string.Empty;

            [JsonProperty("user_id")]
            public string UserId { get; set; } = string.Empty;
        }
    }
}