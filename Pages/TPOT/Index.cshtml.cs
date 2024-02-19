using System;
using System.IO;
using System.Reflection;
using System.Threading.Tasks;
using CodeMechanic.Embeds;
using CodeMechanic.FileSystem;
using CodeMechanic.Types;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace TrashStack.Pages.TPOT;

public class Index : PageModel
{
    private IWebHostEnvironment _environment;
    private IEmbeddedResourceQuery embeds;
    [BindProperty] public IFormFile Upload { get; set; }

    public Index(IWebHostEnvironment environment
        , IEmbeddedResourceQuery embeddedResourceQuery)
    {
        _environment = environment;
        embeds = embeddedResourceQuery;
    }

    public void OnGet()
    {
    }

    public async Task<IActionResult> OnGetSearchWordpress()
    {
        Console.WriteLine(nameof(OnGetSearchWordpress));
        string content = "test";
        string filename = "tpot.rest";

        string cwd = Environment.CurrentDirectory;
        string folder = "api";
        string file_path = Path.Combine(cwd, folder, filename);

        var file_text = System.IO.File.ReadAllLines(file_path);


        return Partial("CurrentFile", file_text);
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

    /// <summary>
    /// https://khalidabuhakmeh.com/how-to-use-embedded-resources-in-dotnet
    /// </summary>
    /// <param name="filename"></param>
    /// <returns></returns>
    private string ReadResourceFile(string filename)
    {
        var thisAssembly = Assembly.GetExecutingAssembly();
        using (var stream = thisAssembly.GetManifestResourceStream(filename))
        {
            using (var reader = new StreamReader(stream))
            {
                return reader.ReadToEnd();
            }
        }
    }
}


// TODO: use the embeds service, instead.
// var ass = Assembly.GetExecutingAssembly(); //.FullName.Dump("current ass");
// this.GetType().Namespace.Dump("current ns");
// var file_text = embeds.Read(ass, filename).ReadAllLinesFromStream();
// file_text = embeds.Read<Index>(filename).ReadAllLinesFromStream();


// I really need to fix that ass. code.