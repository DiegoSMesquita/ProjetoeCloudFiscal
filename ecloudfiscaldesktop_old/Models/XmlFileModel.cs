using ReactiveUI;

namespace eCloudFiscalDesktop.Models
{
    public class XmlFileModel : ReactiveObject
    {
        private string _nome = string.Empty;
        public string Nome
        {
            get => _nome;
            set => this.RaiseAndSetIfChanged(ref _nome, value);
        }

        private string _status = string.Empty;
        public string Status
        {
            get => _status;
            set => this.RaiseAndSetIfChanged(ref _status, value);
        }

        public XmlFileModel(string nome, string status)
        {
            Nome = nome;
            Status = status;
        }
    }
}