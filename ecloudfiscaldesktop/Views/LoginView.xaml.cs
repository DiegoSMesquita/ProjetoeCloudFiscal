using Avalonia.Controls;
using Avalonia.Markup.Xaml; // necessário

namespace eCloudFiscalDesktop.Views;

public partial class LoginView : Window
{
    // Garante que o Avalonia carregue o XAML
    private void InitializeComponent()
    {
        AvaloniaXamlLoader.Load(this);
    }

    public LoginView()
    {
        InitializeComponent();
    }
}