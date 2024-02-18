using System;
using System.Collections.Generic;
using System.IO;
using System.Text.RegularExpressions;
using CodeMechanic.Diagnostics;
using CodeMechanic.FileSystem;
using CodeMechanic.Rest;
using CodeMechanic.Types;

namespace CodeMechanic.FileSystem;

public static class FS
{
    public static FileInfo SaveAs(SaveAs saveAs, params string[] lines)
    {
        if (saveAs == null) throw new ArgumentNullException(nameof(saveAs));
        if (saveAs.file_name == null) throw new ArgumentNullException(nameof(saveAs.file_name));

        // at worst, use cwd:
        if (saveAs.save_folder.IsEmpty() && saveAs.root_path.IsEmpty())
            saveAs.root_path = Environment.CurrentDirectory.Dump("had to use current working directory");

        string save_folder_path = Path.Combine(saveAs.root_path, saveAs.save_folder);

        Console.WriteLine("filename :>> " + saveAs.file_name);
        if (saveAs.create_nonexistent_directory)
            MakeDir(save_folder_path);

        string save_path = Path.Combine(save_folder_path, saveAs.file_name);
        Console.WriteLine("saving to path :>> " + save_path);

        // handle both single and double lines in one method without being retarded <3
        if (lines.Length > 1)
            File.WriteAllLines(save_path, lines);
        // if (lines.Length == 1)
        //     File.WriteAllText(save_path, lines[0]);

        return new FileInfo(save_path);
    }

    public static DirectoryInfo MakeDir(this string folder_path)
    {
        // if ((folder_path).GetPathType() is DirectoryInfo)
        // {
        if (!Directory.Exists(folder_path))
            Directory.CreateDirectory(folder_path);
        return new DirectoryInfo(folder_path);
        // }

        return null;
    }


    public static FileSystemInfo GetPathType(this string path)
    {
        // TODO: regex check path type
        bool is_file_path = PathTypeRegex.LinuxFilePath.IsMatch(path) || PathTypeRegex.WindowsFilePath.IsMatch(path);
        // bool is_dir_path = false;

        if (is_file_path && File.Exists(path))
        {
            return new FileInfo(path);
        }

        if (
            // is_dir_path && 
            Directory.Exists(path))
        {
            return new DirectoryInfo(path);
        }

        throw new ArgumentException($"The string given is neither a file nor a directory: '{path}'");
    }
}

public class PathTypeRegex : Enumeration
{
    private static string windows_fustercluck_of_a_file_path_pattern = """
        (^([a-z]|[A-Z]):(?=\\(?![\0-\37<>:"/\\|?*])|\/(?![\0-\37<>:"/\\|?*])|$)|^\\(?=[\\\/][^\0-\37<>:"/\\|?*]+)|^(?=(\\|\/)$)|^\.(?=(\\|\/)$)|^\.\.(?=(\\|\/)$)|^(?=(\\|\/)[^\0-\37<>:"/\\|?*]+)|^\.(?=(\\|\/)[^\0-\37<>:"/\\|?*]+)|^\.\.(?=(\\|\/)[^\0-\37<>:"/\\|?*]+))((\\|\/)[^\0-\37<>:"/\\|?*]+|(\\|\/)$)*()$
    """; // I had to. 

    public static PathTypeRegex WindowsFilePath =
        new PathTypeRegex(1, nameof(WindowsFilePath), pattern: windows_fustercluck_of_a_file_path_pattern);

    // and UNIX
    public static PathTypeRegex LinuxFilePath =
        new PathTypeRegex(2, nameof(WindowsFilePath), pattern: @"^\/$|(^(?=\/)|^\.|^\.\.)(\/(?=[^/\0])[^/\0]+)*\/?$");

    private Regex compiled;

    public PathTypeRegex(int id, string name, string pattern) : base(id, name)
    {
        Pattern = pattern;
        this.compiled = new Regex(pattern, RegexOptions.Compiled);
    }

    public string Pattern { get; set; } = string.Empty;

    public bool IsMatch(string input) => compiled.IsMatch(input);
}

public static class PathTypeRegexExtensions
{
    private static IDictionary<string, Regex> cache =
        new Dictionary<string, Regex>();

    public static Regex Find(this PathTypeRegex selected)
    {
        string name = selected.Name;
        cache.TryGetValue(name, out Regex compiled);
        return compiled ?? throw new Exception("Could not find regex with name " + name);
    }
}

public record SaveAs //(string file_name)
{
    public SaveAs(string file_name)
    {
        this.file_name = file_name;
    }

    public bool create_nonexistent_directory { get; set; } = true;
    public bool debug { get; set; } = false;
    public string root_path { get; set; } = string.Empty;
    public string save_folder { get; set; } = string.Empty;
    public string file_name { get; set; } = string.Empty;
}