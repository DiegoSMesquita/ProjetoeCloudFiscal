// LoginView.xaml.cs
using Avalonia.Controls;
using Avalonia.Markup.Xaml;
using eCloudFiscalDesktop.ViewModels;

namespace eCloudFiscalDesktop.Views;

public partial class LoginView : Window
{
    public LoginView()
    {
        InitializeComponent();
        DataContext = new LoginViewModel();
    }

    private void InitializeComponent()
    {
        AvaloniaXamlLoader.Load(this);
    }
}
