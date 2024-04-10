using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Reflection;
using System.Runtime.Caching;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using CodeMechanic.Advanced.Regex;
using CodeMechanic.Diagnostics;
using CodeMechanic.Rest;
using Newtonsoft.Json;

namespace CodeMechanic.Curl;

public class RestParserService : IRestParserService
{
    private readonly string projectDirectory;
    private readonly string env_path;
    private readonly string api_key;
    public bool debug_mode { get; set; } = true;

    private readonly MemoryCache cache;

    public RestParserService()
    {
        projectDirectory = Directory
            .GetParent(Environment.CurrentDirectory)
            ?.Parent?.Parent?.FullName;

        api_key = Environment.GetEnvironmentVariable("TODOIST_API_KEY");

        // set up a cahce for json:
        // Create a MemoryCache instance
        cache = MemoryCache.Default;

        // Define cache key and data
        string cacheKey = "FullName";
        string cachedData = "Nick Preston";

        // Add data to the cache with an expiration time of 5 minutes
        CacheItemPolicy cachePolicy = new CacheItemPolicy
        {
            AbsoluteExpiration = DateTimeOffset.Now.AddMinutes(5)
        };

        cache.Add(cacheKey, cachedData, cachePolicy);
    }


    public List<RestQueryOptions> GetClient(string text)
    {
        RestRegex rgx = get_regex_from_rest_query(text);
        var regex = rgx.Find();
        // regex.Dump(nameof(regex));
        // Console.WriteLine(text);

        var options = text.Extract<RestQueryOptions>(regex);

        if (debug_mode)
            options.Dump(nameof(options));

        return options;
    }


    private RestRegex get_regex_from_rest_query(string query)
    {
        if (Regex.IsMatch(query, @".*GET.*"))
        {
            return Rest.RestRegex.GET;
        }

        // if (Regex.IsMatch(query, @"-X\s*(POST)"))
        // {
        //     return Rest.RestRegex.POST;
        // }

        // return Rest.RestRegex.HEADERS;
        return Rest.RestRegex.GET;
    }

    public async Task<string> GetContentAsync(string uri, string bearer_token, bool debug = false)
    {
        using HttpClient http = new HttpClient();
        http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", bearer_token);
        var response = await http.GetAsync(uri);
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();
        if (debug)
            Console.WriteLine("content :>> " + content);
        return content;
    }

    public async Task<string> PostPayloadAsync<T>(T payload) where T : class
    {
        using HttpClient http = new HttpClient();

        string item = JsonConvert.SerializeObject(payload);
        var requestContent = new StringContent(item, Encoding.UTF8, "application/json");
        var response = await http.PostAsync("companies", requestContent);
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();

        return content;
    }

    [Obsolete("I have a SaveAs() method I wish to trial and perfect")]
    private IEnumerable<string> SaveAsJsonFiles(string[] responses)
    {
        string output_folder = Path.Combine(projectDirectory, "samples");

        Console.WriteLine("created dir :>> " + output_folder);
        if (!Directory.Exists(output_folder))
            Directory.CreateDirectory(output_folder);

        foreach (var line in responses)
        {
            string save_path = Path.Combine(projectDirectory, output_folder,
                "response" + Guid.NewGuid().ToString() + ".json");
            Console.WriteLine($"saving to :>> '{save_path}'");

            File.WriteAllText(save_path, line);
            yield return save_path;
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