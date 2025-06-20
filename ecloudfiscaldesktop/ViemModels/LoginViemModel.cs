using ReactiveUI;
using System.Reactive;
using System.Threading.Tasks;

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
            if (Email == "admin@teste.com" && Password == "123456")
            {
                // Simula login bem-sucedido (substituir com chamada à API)
                var main = new Views.MainView();
                main.Show();

                // Fecha a janela de login
                foreach (var win in Avalonia.Application.Current.ApplicationLifetime
                             as Avalonia.Controls.ApplicationLifetimes.IClassicDesktopStyleApplicationLifetime)
                {
                    win.MainWindow?.Close();
                }
            }
            else
            {
                await Task.Run(() =>
                {
                    // Aqui você pode mostrar uma mensagem de erro ou status
                });
            }
        }
    }
}