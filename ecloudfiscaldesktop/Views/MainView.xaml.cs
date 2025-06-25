using Avalonia.Controls;
using Avalonia.Markup.Xaml; // necessário

namespace eCloudFiscalDesktop.Views;
    // Garante que o Avalonia carregue o XAML
public partial class MainView : Window
{
    public void InitializeComponent()
    {
        AvaloniaXamlLoader.Load(this);
    }
    public MainView()
    {
        InitializeComponent();
    }
}