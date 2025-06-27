using Avalonia.Controls;
using Avalonia.Markup.Xaml;

namespace eCloudFiscalDesktop.Views;

public partial class MainView : Window
{
    public MainView()
    {
        InitializeComponent();
    }

    private void InitializeComponent()
    {
        AvaloniaXamlLoader.Load(this);
    }
}