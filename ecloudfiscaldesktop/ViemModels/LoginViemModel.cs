using ReactiveUI;
using System.Reactive;
using System.Threading.Tasks;
using Avalonia;
using Avalonia.Controls.ApplicationLifetimes;

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
                // ✅ Simula login
                var main = new Views.MainView();
                main.Show();

                var lifetime = Application.Current.ApplicationLifetime 
                               as IClassicDesktopStyleApplicationLifetime;

                lifetime?.MainWindow?.Close();
            }
            else
            {
                await Task.Run(() =>
                {
                    // Aqui você pode exibir um alerta ou status
                });
            }
        }
    }
}