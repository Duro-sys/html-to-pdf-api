import http.client, json

conn = http.client.HTTPSConnection("html-to-pdf-generator3.p.rapidapi.com")

payload = json.dumps({
    "url": "https://pt.wikipedia.org/wiki/Super_Mario" #example url, you can change it to any url you want
})

headers = {
    'x-rapidapi-key': "YOUR_RAPIDAPI_KEY", #replace with your RapidAPI key
    'x-rapidapi-host': "html-to-pdf-generator3.p.rapidapi.com",
    'Content-Type': "application/json"
}

conn.request("POST", "/generate-pdf", payload, headers)
res = conn.getresponse()
data = res.read()

with open(r"C:\Users\Exemple\Downloads\super_mario_wiki.pdf", "wb") as f: #Change the path to your desired location
    f.write(data)

print("PDF downloaded.")
