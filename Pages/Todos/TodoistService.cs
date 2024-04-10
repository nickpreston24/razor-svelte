using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Reflection;
using System.Runtime.Caching;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using CodeMechanic.Advanced.Regex;
using CodeMechanic.Diagnostics;
using Newtonsoft.Json;

namespace CodeMechanic.Todoist;


public class TodoistService : ITodoistService
{
    private readonly string projectDirectory;
    private readonly string env_path;
    private readonly string api_key;
    public bool debug_mode { get; set; } = true;

    private readonly MemoryCache cache;

    public TodoistService()
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


    public async Task<TodoistStats> GetProjectsAndTasks()
    {
        string[] responses;

        var cached_responses = cache.Get("responses");

        if (cached_responses != null)
        {
            Console.WriteLine("Using cached responses...");
            return CreateStats(cached_responses as string[]);
        }

        string filename = "todoist.rest";
        var file_text = ReadResourceFile("CodeMechanic.Todoist." + filename);

        // Update the curl string to always have the most updated bearer token (and not a sample, like most tutorials)
        string curl =
                Regex.Replace(
                    file_text
                    , @"Bearer \$?\w+"
                    , "Bearer " + api_key
                )
            ;

        Console.WriteLine("Curl text :>> " + curl);

        var options = GetClient(curl);

        Console.WriteLine("Total options :>> " + options.Count);

        var all_tasks = options
            .Select(curl_options => GetContentAsync(curl_options.uri, curl_options.bearer_token))
            .ToList();

        Console.WriteLine("Calling API...");
        Console.WriteLine("total tasks running :>> " + all_tasks.Count);

        responses = await Task.WhenAll(all_tasks);
        Console.WriteLine("responses :>> ", responses.Length);

        cache.Add("responses", responses, new CacheItemPolicy()
        {
            AbsoluteExpiration = DateTimeOffset.Now.AddMinutes(5)
        });

        TodoistStats stats = CreateStats(responses);

        return stats;
    }

    private TodoistStats CreateStats(string[] responses)
    {
        Console.WriteLine("responses passed in :>> " + responses.Length);

        var completed_tasks = responses
            .Where(json => json.Contains("completed_at"))
            .SelectMany(json => JsonConvert.DeserializeObject<CompletedItems>(json).items)
            .ToList();

        Console.WriteLine("responses for completed tasks: " + completed_tasks.Count);
        // Console.WriteLine("first completed task :> " + completed_tasks.FirstOrDefault());

        // completed_tasks.Take(5).Dump("first 5");

        // string json = completed_tasks.FirstOrDefault();
        // var item = JsonConvert.DeserializeObject<CompletedItems>(json);
        // item.items.Dump("items");

        string projects_json = responses
            .FirstOrDefault(text => text.Contains("comment_count"));

        string tasks_json = responses
            .FirstOrDefault(text => text.Contains("project_id"));

        var projects = projects_json.Deserialize<TodoistProject>();
        var todoist_tasks = tasks_json.Deserialize<TodoistTask>();

        return new TodoistStats()
            {
                CompletedTasks = completed_tasks, TodoistProjects = projects, TodoistTasks = todoist_tasks
            }
            // .Dump("full stats ... awwww yeeaaaahhh")
            ;
    }

    public List<CurlOptions> GetClient(string curl)
    {
        var curlRegex = get_regex_from_curl(curl);
        var regex = CurlRegex.Find(curlRegex);
        // regex.Dump(nameof(regex));
        // Console.WriteLine(curl);

        var curl_options = curl.Extract<CurlOptions>(regex);

        if (debug_mode)
            curl_options.Dump(nameof(curl_options));

        return curl_options;
    }


    private CurlRegex get_regex_from_curl(string curl)
    {
        if (Regex.IsMatch(curl, @"-X\s*(GET)"))
        {
            return CurlRegex.GET;
        }

        if (Regex.IsMatch(curl, @"-X\s*(POST)"))
        {
            return CurlRegex.POST;
        }

        return CurlRegex.HEADERS;
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

    public async Task<object?> PostTodoistAsync(string api_key = "")
    {
        throw new NotImplementedException("Tell Nick to finish this!");
        using HttpClient http = new HttpClient();

        var task = new TodoistTask
        {
        };

        string todoist_task = JsonConvert.SerializeObject(task);
        var requestContent = new StringContent(todoist_task, Encoding.UTF8, "application/json");
        var response = await http.PostAsync("companies", requestContent);
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();
        var created_item = JsonConvert.DeserializeObject(content, new JsonSerializerSettings()
        {
        });
        return created_item;
    }

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