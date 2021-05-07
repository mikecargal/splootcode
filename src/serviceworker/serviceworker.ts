import { generateScopeWithoutTypes } from "../language/scope/scope";
import { DATA_SHEET } from "../language/types/dataset/datasheet";
import { JAVASCRIPT_FILE } from "../language/types/js/javascript_file";
import { loadTypes } from "../language/type_loader";
import { deserializeNode, SerializedNode } from "../language/type_registry";

const CacheName = 'splootcache-v1';

const PARENT_TARGET_DOMAIN = process.env.EDITOR_DOMAIN;
const TRACKER_FILE = `

export function captureProps(nodePath, componentName, props) {
  console.log('I am inside the preview frame');
  let payload = {
    type: 'captureProps',
    data: {nodePath: nodePath, componentName: componentName, props: props}
  };
  parent.postMessage(payload, "${PARENT_TARGET_DOMAIN}");
}
`

loadTypes();

self.addEventListener('install', function(event) {
  caches.delete(CacheName);
  return Promise.resolve('loaded');
});

async function addFileToCache(pathname: string, contentType: string, contents: string) {
  caches.open(CacheName).then(function(cache) {
    let request = pathname;
    let headers = {'Content-Type': contentType};
    let response = new Response(contents, {status: 200, statusText: 'ok', headers: headers});  
    cache.put(request, response);
  });
}

self.addEventListener('fetch', (event : FetchEvent) => {
  let reqUrl = new URL(event.request.url);
  if (reqUrl.origin === self.location.origin) {
    event.respondWith(caches.open(CacheName).then(cache => {
      return cache.match(event.request).then(function(response) {
        return response || fetch(event.request);
      });
    }));
  }
});

async function handleNodeTree(filename: string, serializedNode: SerializedNode) {
  let rootNode = deserializeNode(serializedNode);
  generateScopeWithoutTypes(rootNode);
  if (rootNode === null) {
    console.warn('Failed to deserialize node tree.');
    return;
  }
  let contentType = 'text/html;charset=UTF-8';
  switch (serializedNode.type) {
    case JAVASCRIPT_FILE:
    case DATA_SHEET:
      contentType = 'text/javascript';
      break;
  }
  addFileToCache('/' + filename, contentType, rootNode.generateCodeString());
  addFileToCache('/__sploottracker.js', 'text/javascript', TRACKER_FILE);
}

self.addEventListener('message', (event: MessageEvent) => {
  let data = event.data;
  if (event.origin == self.location.origin) {
    switch (data.type) {
      case 'nodetree':
        let {filename, tree} = data.data;
        handleNodeTree(filename, tree as SerializedNode);
        // @ts-ignore
        event.source.postMessage({type: 'loaded', filename: filename});
        break;
      default:
        console.log('Service worker. Unknown message from origin:', event);
    }
  }
});