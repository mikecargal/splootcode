{"type":"JAVASCRIPT_FILE","properties":{},"childSets":{"body":[{"type":"IMPORT","properties":{},"childSets":{"source":[{"type":"STRING_LITERAL","properties":{"value":"https://unpkg.com/es-react@16.13.1"},"childSets":{}}],"specifiers":[{"type":"DECLARED_IDENTIFIER","properties":{"identifier":"React"},"childSets":{}}]}},{"type":"IMPORT_DEFAULT","properties":{},"childSets":{"source":[{"type":"STRING_LITERAL","properties":{"value":"https://cdn.skypack.dev/jss"},"childSets":{}}],"identifier":[{"type":"DECLARED_IDENTIFIER","properties":{"identifier":"jss"},"childSets":{}}]}},{"type":"JSS_STYLE_BLOCK","properties":{},"childSets":{"body":[{"type":"JSS_CLASS_BLOCK","properties":{},"childSets":{"identifier":[{"type":"DECLARED_IDENTIFIER","properties":{"identifier":"container"},"childSets":{}}],"body":[{"type":"JSS_STYLE_PROPERTY","properties":{"property":"display"},"childSets":{"value":[{"type":"STRING_LITERAL","properties":{"value":"flex"},"childSets":{}}]}},{"type":"JSS_STYLE_PROPERTY","properties":{"property":"justify-content"},"childSets":{"value":[{"type":"STRING_LITERAL","properties":{"value":"center"},"childSets":{}}]}},{"type":"JSS_STYLE_PROPERTY","properties":{"property":"align-items"},"childSets":{"value":[{"type":"STRING_LITERAL","properties":{"value":"center"},"childSets":{}}]}},{"type":"JSS_STYLE_PROPERTY","properties":{"property":"margin"},"childSets":{"value":[{"type":"STRING_LITERAL","properties":{"value":"10vmin"},"childSets":{}}]}},{"type":"JSS_STYLE_PROPERTY","properties":{"property":"overflow"},"childSets":{"value":[{"type":"STRING_LITERAL","properties":{"value":"hidden"},"childSets":{}}]}},{"type":"JSS_STYLE_PROPERTY","properties":{"property":"transform"},"childSets":{"value":[{"type":"STRING_LITERAL","properties":{"value":"skew(5deg)"},"childSets":{}}]}}]}},{"type":"JSS_CLASS_BLOCK","properties":{},"childSets":{"identifier":[{"type":"DECLARED_IDENTIFIER","properties":{"identifier":"card"},"childSets":{}}],"body":[{"type":"JSS_STYLE_PROPERTY","properties":{"property":"flex"},"childSets":{"value":[{"type":"STRING_LITERAL","properties":{"value":"1"},"childSets":{}}]}},{"type":"JSS_STYLE_PROPERTY","properties":{"property":"transition"},"childSets":{"value":[{"type":"STRING_LITERAL","properties":{"value":"all 1s ease-in-out"},"childSets":{}}]}},{"type":"JSS_STYLE_PROPERTY","properties":{"property":"height"},"childSets":{"value":[{"type":"STRING_LITERAL","properties":{"value":"75vmin"},"childSets":{}}]}},{"type":"JSS_STYLE_PROPERTY","properties":{"property":"position"},"childSets":{"value":[{"type":"STRING_LITERAL","properties":{"value":"relative"},"childSets":{}}]}},{"type":"JSS_STYLE_PROPERTY","properties":{"property":"margin-right"},"childSets":{"value":[{"type":"STRING_LITERAL","properties":{"value":"1em"},"childSets":{}}]}},{"type":"JSS_HOVER_BLOCK","properties":{},"childSets":{"body":[{"type":"JSS_STYLE_PROPERTY","properties":{"property":"flex-grow"},"childSets":{"value":[{"type":"STRING_LITERAL","properties":{"value":"10"},"childSets":{}}]}}]}}]}},{"type":"JSS_CLASS_BLOCK","properties":{},"childSets":{"identifier":[{"type":"DECLARED_IDENTIFIER","properties":{"identifier":"img"},"childSets":{}}],"body":[{"type":"JSS_STYLE_PROPERTY","properties":{"property":"width"},"childSets":{"value":[{"type":"STRING_LITERAL","properties":{"value":"100%"},"childSets":{}}]}},{"type":"JSS_STYLE_PROPERTY","properties":{"property":"height"},"childSets":{"value":[{"type":"STRING_LITERAL","properties":{"value":"100%"},"childSets":{}}]}},{"type":"JSS_STYLE_PROPERTY","properties":{"property":"object-fit"},"childSets":{"value":[{"type":"STRING_LITERAL","properties":{"value":"cover"},"childSets":{}}]}},{"type":"JSS_STYLE_PROPERTY","properties":{"property":"transition"},"childSets":{"value":[{"type":"STRING_LITERAL","properties":{"value":"all 1s ease-in-out"},"childSets":{}}]}},{"type":"JSS_STYLE_PROPERTY","properties":{"property":"filter"},"childSets":{"value":[{"type":"STRING_LITERAL","properties":{"value":"grayscale(100%)"},"childSets":{}}]}},{"type":"JSS_HOVER_BLOCK","properties":{},"childSets":{"body":[{"type":"JSS_STYLE_PROPERTY","properties":{"property":"filter"},"childSets":{"value":[{"type":"STRING_LITERAL","properties":{"value":"grayscale(0)"},"childSets":{}}]}}]}}]}}]}},{"type":"COMPONENT_DECLARATION","properties":{},"childSets":{"identifier":[{"type":"DECLARED_IDENTIFIER","properties":{"identifier":"Photo"},"childSets":{}}],"props":[{"type":"DELCARED_PROEPRTY","properties":{"identifier":"url"},"childSets":{}}],"body":[{"type":"RETURN_STATEMENT","properties":{},"childSets":{"expression":[{"type":"SPLOOT_EXPRESSION","properties":{},"childSets":{"tokens":[{"type":"REACT_ELEMENT","properties":{"tag":"div"},"childSets":{"attributes":[{"type":"COMPONENT_PROPERTY","properties":{"name":"class"},"childSets":{"value":[{"type":"SPLOOT_EXPRESSION","properties":{},"childSets":{"tokens":[{"type":"JSS_CLASS_REFERENCE","properties":{"name":"card"},"childSets":{}}]}}]}}],"content":[{"type":"SPLOOT_EXPRESSION","properties":{},"childSets":{"tokens":[{"type":"REACT_ELEMENT","properties":{"tag":"img"},"childSets":{"attributes":[{"type":"COMPONENT_PROPERTY","properties":{"name":"src"},"childSets":{"value":[{"type":"SPLOOT_EXPRESSION","properties":{},"childSets":{"tokens":[{"type":"PROPERTY_REFERENCE","properties":{"identifier":"url"},"childSets":{}}]}}]}},{"type":"COMPONENT_PROPERTY","properties":{"name":"class"},"childSets":{"value":[{"type":"SPLOOT_EXPRESSION","properties":{},"childSets":{"tokens":[{"type":"JSS_CLASS_REFERENCE","properties":{"name":"img"},"childSets":{}}]}}]}}],"content":[]}}]}}]}}]}}]}}]}},{"type":"COMPONENT_DECLARATION","properties":{},"childSets":{"identifier":[{"type":"DECLARED_IDENTIFIER","properties":{"identifier":"Gallery"},"childSets":{}}],"props":[],"body":[{"type":"VARIABLE_DECLARATION","properties":{},"childSets":{"identifier":[{"type":"DECLARED_IDENTIFIER","properties":{"identifier":"photos"},"childSets":{}}],"init":[{"type":"SPLOOT_EXPRESSION","properties":{},"childSets":{"tokens":[{"type":"LIST_EXPRESSION","properties":{},"childSets":{"values":[{"type":"SPLOOT_EXPRESSION","properties":{},"childSets":{"tokens":[{"type":"STRING_LITERAL","properties":{"value":"https://placekitten.com/600/400"},"childSets":{}}]}},{"type":"SPLOOT_EXPRESSION","properties":{},"childSets":{"tokens":[{"type":"STRING_LITERAL","properties":{"value":"https://placekitten.com/408/287"},"childSets":{}}]}},{"type":"SPLOOT_EXPRESSION","properties":{},"childSets":{"tokens":[{"type":"STRING_LITERAL","properties":{"value":"https://placekitten.com/500/350"},"childSets":{}}]}}]}}]}}]}},{"type":"RETURN_STATEMENT","properties":{},"childSets":{"expression":[{"type":"SPLOOT_EXPRESSION","properties":{},"childSets":{"tokens":[{"type":"REACT_ELEMENT","properties":{"tag":"div"},"childSets":{"attributes":[{"type":"COMPONENT_PROPERTY","properties":{"name":"class"},"childSets":{"value":[{"type":"SPLOOT_EXPRESSION","properties":{},"childSets":{"tokens":[{"type":"JSS_CLASS_REFERENCE","properties":{"name":"container"},"childSets":{}}]}}]}}],"content":[{"type":"FOR_EACH_EXPRESSION","properties":{},"childSets":{"identifier":[{"type":"DECLARED_IDENTIFIER","properties":{"identifier":"photo"},"childSets":{}}],"iterable":[{"type":"SPLOOT_EXPRESSION","properties":{},"childSets":{"tokens":[{"type":"VARIABLE_REFERENCE","properties":{"identifier":"photos"},"childSets":{}}]}}],"content":[{"type":"SPLOOT_EXPRESSION","properties":{},"childSets":{"tokens":[{"type":"COMPONENT_INVOCATION","properties":{"name":"Photo"},"childSets":{"attributes":[{"type":"COMPONENT_PROPERTY","properties":{"name":"url"},"childSets":{"value":[{"type":"SPLOOT_EXPRESSION","properties":{},"childSets":{"tokens":[{"type":"VARIABLE_REFERENCE","properties":{"identifier":"photo"},"childSets":{}}]}}]}}],"content":[]}}]}}]}}]}}]}}]}}]}}]}}
