using ReactiveUI;

namespace eCloudFiscalDesktop.Models
{
    public class XmlFileModel : ReactiveObject
    {
        public string Nome { get; set; }

        private string _status;
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