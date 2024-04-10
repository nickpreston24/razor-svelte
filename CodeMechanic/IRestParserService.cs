using System.Collections.Generic;
using System.Threading.Tasks;
using CodeMechanic.Rest;

namespace CodeMechanic.Curl;

public interface IRestParserService
{
    bool debug_mode { get; set; }
    List<RestQueryOptions> GetClient(string text);
    Task<string> GetContentAsync(string uri, string bearer_token, bool debug = false);
    Task<string> PostPayloadAsync<T>(T payload) where T : class;
}