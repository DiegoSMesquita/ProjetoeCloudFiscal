using Avalonia;
using System;

namespace eCloudFiscalDesktop
{
    internal static class Program
    {
        // Entry point da aplicação
        [STAThread]
        public static void Main(string[] args)
        {
            BuildAvaloniaApp()
                .StartWithClassicDesktopLifetime(args);
        }

        // Cria e configura a aplicação Avalonia
        public static AppBuilder BuildAvaloniaApp()
            => AppBuilder.Configure<App>()
                         .UsePlatformDetect()
                         .LogToTrace()
                         .UseReactiveUI(); // Necessário se estiver usando ReactiveUI
    }
}