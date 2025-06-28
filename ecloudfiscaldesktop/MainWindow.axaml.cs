using Avalonia.Controls;

namespace eCloudFiscalDesktop;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
        // Não setar DataContext para evitar problemas de threading
    }
}