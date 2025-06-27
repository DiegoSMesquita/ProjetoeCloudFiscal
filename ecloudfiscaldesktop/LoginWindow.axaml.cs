using Avalonia.Controls;

namespace eCloudFiscalDesktop;

public partial class LoginWindow : Window
{
    public LoginWindow()
    {
        InitializeComponent();
        DataContext = new LoginViewModel();
    }
}
