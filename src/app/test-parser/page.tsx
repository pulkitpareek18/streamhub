'use client';

import { useState } from 'react';
import { parseM3U, parseM3UFromURL } from '@/lib/parser';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

export default function TestParserPage() {
  const [testResults, setTestResults] = useState<string>('');
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);

  const runBasicTest = () => {
    const sampleM3U = `#EXTM3U
#EXTINF:-1 tvg-id="bbc1" tvg-name="BBC One" tvg-logo="https://logo.com/bbc1.png" group-title="UK News",BBC One HD
http://stream.bbc.com/bbc1.m3u8
#EXTINF:-1 tvg-id="cnn" tvg-name="CNN" group-title="US News",CNN International
http://stream.cnn.com/live.m3u8`;

    const result = parseM3U(sampleM3U);

    let output = '=== Basic M3U Parsing Test ===\n\n';

    if (result.success && result.playlist) {
      output += `✅ Success!\n`;
      output += `Total channels: ${result.playlist.totalCount}\n`;
      output += `Groups: ${result.playlist.groups.length}\n\n`;

      output += 'Channels:\n';
      result.playlist.channels.forEach((ch) => {
        output += `- ${ch.name} (${ch.group || 'No group'})\n`;
        output += `  ID: ${ch.id}\n`;
        output += `  URL: ${ch.url}\n`;
        output += `  Logo: ${ch.logo || 'No logo'}\n\n`;
      });

      output += 'Groups:\n';
      result.playlist.groups.forEach((g) => {
        output += `- ${g.name}: ${g.count} channels\n`;
      });
    } else {
      output += `❌ Failed: ${result.error}`;
    }

    setTestResults(output);
  };

  const runEdgeCasesTest = () => {
    let output = '=== Edge Cases Tests ===\n\n';

    // Test 1: Missing attributes
    output += '--- Test 1: Missing attributes ---\n';
    const noAttributes = `#EXTM3U
#EXTINF:-1,Simple Channel
http://stream.com/live.m3u8`;

    const result1 = parseM3U(noAttributes);
    if (result1.success && result1.playlist) {
      output += `✅ Parsed: ${result1.playlist.totalCount} channel(s)\n`;
      output += `Channel: ${result1.playlist.channels[0].name}\n\n`;
    } else {
      output += `❌ Failed: ${result1.error}\n\n`;
    }

    // Test 2: Malformed entries
    output += '--- Test 2: Malformed entries (should skip bad URL) ---\n';
    const malformed = `#EXTM3U
#EXTINF:-1,Good Channel
http://good.stream.com/live.m3u8
#EXTINF:-1,Bad Channel
NOT_A_URL
#EXTINF:-1,Another Good
http://another.stream.com/live.m3u8`;

    const result2 = parseM3U(malformed);
    if (result2.success && result2.playlist) {
      output += `✅ Parsed: ${result2.playlist.totalCount} channel(s) (should be 2)\n`;
      output += `Test: ${result2.playlist.totalCount === 2 ? '✅ PASS' : '❌ FAIL'}\n\n`;
    } else {
      output += `❌ Failed: ${result2.error}\n\n`;
    }

    // Test 3: Empty playlist
    output += '--- Test 3: Empty playlist (should fail) ---\n';
    const empty = `#EXTM3U`;
    const result3 = parseM3U(empty);
    output += `${!result3.success ? '✅ Correctly rejected' : '❌ Should have failed'}\n`;
    output += `Error: ${result3.error}\n\n`;

    // Test 4: Missing header
    output += '--- Test 4: Missing #EXTM3U header (should fail) ---\n';
    const noHeader = `#EXTINF:-1,Channel
http://stream.com/live.m3u8`;
    const result4 = parseM3U(noHeader);
    output += `${!result4.success ? '✅ Correctly rejected' : '❌ Should have failed'}\n`;
    output += `Error: ${result4.error}\n\n`;

    // Test 5: Special characters
    output += '--- Test 5: Special characters in name ---\n';
    const specialChars = `#EXTM3U
#EXTINF:-1,Channel "Special" & More <Test>
http://stream.com/live.m3u8`;
    const result5 = parseM3U(specialChars);
    if (result5.success && result5.playlist) {
      output += `✅ Handled special characters\n`;
      output += `Channel name: ${result5.playlist.channels[0].name}\n`;
    }

    setTestResults(output);
  };

  const testUrlLoading = async () => {
    if (!urlInput.trim()) {
      setTestResults('❌ Please enter a URL');
      return;
    }

    setLoading(true);
    let output = `=== URL Loading Test ===\n\n`;
    output += `URL: ${urlInput}\n\n`;

    try {
      const result = await parseM3UFromURL(urlInput);

      if (result.success && result.playlist) {
        output += `✅ Success!\n`;
        output += `Total channels: ${result.playlist.totalCount}\n`;
        output += `Groups: ${result.playlist.groups.length}\n\n`;

        output += 'First 10 channels:\n';
        result.playlist.channels.slice(0, 10).forEach((ch, idx) => {
          output += `${idx + 1}. ${ch.name} (${ch.group || 'No group'})\n`;
        });

        if (result.playlist.totalCount > 10) {
          output += `\n... and ${result.playlist.totalCount - 10} more channels\n`;
        }

        output += '\n\nGroups:\n';
        result.playlist.groups.forEach((g) => {
          output += `- ${g.name}: ${g.count} channels\n`;
        });
      } else {
        output += `❌ Failed: ${result.error}`;
      }
    } catch (error) {
      output += `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }

    setTestResults(output);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background-primary p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>M3U Parser Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400">
              Test the M3U/M3U8 playlist parser implementation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={runBasicTest}>Run Basic Test</Button>
              <Button onClick={runEdgeCasesTest} variant="secondary">
                Run Edge Cases
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400">Test URL Loading:</label>
              <div className="flex gap-2">
                <Input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/playlist.m3u"
                  className="flex-1"
                />
                <Button onClick={testUrlLoading} disabled={loading}>
                  {loading ? 'Loading...' : 'Load URL'}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Try: https://iptv-org.github.io/iptv/countries/us.m3u
              </p>
            </div>
          </CardContent>
        </Card>

        {testResults && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-background-tertiary p-4 rounded text-sm overflow-auto max-h-96 text-gray-300 whitespace-pre-wrap">
                {testResults}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
