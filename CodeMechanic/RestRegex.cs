using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using CodeMechanic.Types;

namespace CodeMechanic.Rest;

public class RestRegex : Enumeration
{
    // https://regex101.com/r/poaUVO/1
    public static RestRegex GET = new RestRegex(1, nameof(GET),
        pattern: @"(?<execution_method>GET)\s*(?<uri>(https)://.*(.com)(?<api_route>\/.*\/\w+)(?<parameters>\?.*$)?)");

    public RestRegex(int id, string name, string pattern) : base(id, name)
    {
        this.pattern = pattern;
    }

    public string pattern { get; set; } = string.Empty;

    // public static Regex Find(RestRegex selected)
    // {
    //     string name = selected.Name;
    //     RestRegexExtensions.cache.TryGetValue(name, out Regex compiled);
    //     return compiled ?? throw new Exception("Could not find regex with name " + name);
    // }
}

public static class RestRegexExtensions
{
    private static IDictionary<string, Regex> cache =
        new Dictionary<string, Regex>();

    public static Regex Find(this RestRegex selected)
    {
        string name = selected.Name;
        cache.TryGetValue(name, out Regex compiled);
        return compiled ?? throw new Exception("Could not find regex with name " + name);
    }
}