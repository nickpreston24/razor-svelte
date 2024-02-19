using System;
using System.IO;
using System.Reflection;
using System.Threading.Tasks;
using CodeMechanic.Curl;
using CodeMechanic.FileSystem;
using CodeMechanic.Types;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace SvelteRazor.Pages.TPOT;

public class Index : PageModel
{
    private IWebHostEnvironment _environment;
    [BindProperty] public IFormFile Upload { get; set; }

    public Index(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    public void OnGet()
    {
    }

    public async Task<IActionResult> OnGetSearchWordpress()
    {
        Console.WriteLine(nameof(OnGetSearchWordpress));
        return Partial("_ParsedAPI", null);
    }

    public async Task OnPostAsync()
    {
        if (Upload == null || Upload.FileName.IsEmpty()) return;
        string save_dir = Path.Combine(_environment.ContentRootPath, "uploads");
        FS.MakeDir(save_dir);
        var save_path = Path.Combine(save_dir, Upload.FileName);
        Console.WriteLine($"Saving file to '{save_path}'");
        using (var fileStream = new FileStream(save_path, FileMode.Create))
        {
            await Upload.CopyToAsync(fileStream);
        }
    }
}