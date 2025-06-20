using Avalonia.Controls;
using Avalonia.Interactivity;
using eCloudFiscalDesktop.ViewModels;

namespace eCloudFiscalDesktop.Views
{
    public partial class LoginView : Window
    {
        public LoginView()
        {
            InitializeComponent();
        }

        private void OnPasswordChanged(object sender, RoutedEventArgs e)
        {
            if (this.DataContext is LoginViewModel vm && sender is PasswordBox pb)
            {
                vm.Password = pb.Password;
            }
        }
    }
}