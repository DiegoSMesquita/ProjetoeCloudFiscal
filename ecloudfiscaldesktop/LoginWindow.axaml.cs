using Avalonia.Controls;
using Avalonia.Interactivity;
using System.Text.RegularExpressions;
using System.Net.Http;
using System.Net.Http.Json;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using Avalonia; // Para Thickness

namespace eCloudFiscalDesktop;

public partial class LoginWindow : Window
{
    public LoginWindow()
    {
        InitializeComponent();
    }

    private async void OnEntrarClick(object? sender, RoutedEventArgs e)
    {
        var email = EmailBox.Text?.Trim() ?? string.Empty;
        var senha = SenhaBox.Text ?? string.Empty;
        MsgErro.IsVisible = false;

        if (!IsValidEmail(email))
        {
            MsgErro.Text = "Digite um e-mail válido.";
            MsgErro.IsVisible = true;
            return;
        }
        if (string.IsNullOrWhiteSpace(senha))
        {
            MsgErro.Text = "Digite a senha.";
            MsgErro.IsVisible = true;
            return;
        }

        try
        {
            var client = new HttpClient();
            var payload = new { email = email, password = senha };
            var response = await client.PostAsJsonAsync("http://localhost:8080/api/login", payload);
            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadFromJsonAsync<LoginResult>();
                if (result != null && result.cnpjs != null && result.cnpjs.Count > 0)
                {
                    var cnpjEscolhido = await ShowCnpjDialog(result.cnpjs);
                    if (!string.IsNullOrEmpty(cnpjEscolhido))
                    {
                        var main = new MainWindow();
                        main.Show();
                        this.Close();
                    }
                }
                else
                {
                    MsgErro.Text = "Usuário sem CNPJ vinculado.";
                    MsgErro.IsVisible = true;
                }
            }
            else
            {
                MsgErro.Text = "E-mail ou senha incorretos.";
                MsgErro.IsVisible = true;
            }
        }
        catch (Exception ex)
        {
            MsgErro.Text = $"Erro de conexão: {ex.Message}";
            MsgErro.IsVisible = true;
        }
    }

    private bool IsValidEmail(string email)
    {
        return Regex.IsMatch(email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$");
    }

    private async Task<string> ShowCnpjDialog(List<CnpjInfo> cnpjs)
    {
        var combo = new ComboBox
        {
            ItemsSource = cnpjs,
            SelectedIndex = 0,
            Margin = new Thickness(10)
        };
        var btn = new Button { Content = "Confirmar", Margin = new Thickness(10), HorizontalAlignment = Avalonia.Layout.HorizontalAlignment.Right };
        var dialog = new Window
        {
            Title = "Selecione o CNPJ",
            Width = 350,
            Height = 220,
            Content = new StackPanel
            {
                Spacing = 10,
                Children =
                {
                    new TextBlock { Text = "Escolha o CNPJ para usar:", Margin = new Thickness(10) },
                    combo,
                    btn
                }
            }
        };
        string? cnpjSelecionado = null;
        btn.Click += (_, _) =>
        {
            if (combo.SelectedItem is CnpjInfo cnpj)
            {
                cnpjSelecionado = cnpj.cnpj;
                dialog.Close();
            }
        };
        await dialog.ShowDialog(this);
        return cnpjSelecionado ?? string.Empty;
    }

    private class LoginResult
    {
        public int user_id { get; set; }
        public string email { get; set; } = string.Empty;
        public List<CnpjInfo> cnpjs { get; set; } = new();
    }
    private class CnpjInfo
    {
        public string cnpj { get; set; } = string.Empty;
        public string nome_loja { get; set; } = string.Empty;
        public override string ToString() => $"{cnpj} - {nome_loja}";
    }
}
