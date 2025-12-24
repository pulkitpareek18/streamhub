/**
 * Manual test file for M3U parser
 * Run these tests by importing and executing in a component or console
 */

import { parseM3U } from '../parser';

// Test 2.1: Basic M3U Parsing
export function testBasicParsing() {
  console.log('=== Test 2.1: Basic M3U Parsing ===');

  const sampleM3U = `#EXTM3U
#EXTINF:-1 tvg-id="bbc1" tvg-name="BBC One" tvg-logo="https://logo.com/bbc1.png" group-title="UK News",BBC One HD
http://stream.bbc.com/bbc1.m3u8
#EXTINF:-1 tvg-id="cnn" tvg-name="CNN" group-title="US News",CNN International
http://stream.cnn.com/live.m3u8`;

  const result = parseM3U(sampleM3U);

  console.log('Result:', result);

  if (result.success && result.playlist) {
    console.log('✅ Parsed successfully');
    console.log('Total channels:', result.playlist.totalCount);
    console.log('Groups:', result.playlist.groups.length);
    console.log('\nChannels:');
    result.playlist.channels.forEach((ch) => {
      console.log(`- ${ch.name} (${ch.group || 'No group'})`);
      console.log(`  ID: ${ch.id}`);
      console.log(`  URL: ${ch.url}`);
      console.log(`  Logo: ${ch.logo || 'No logo'}`);
    });
    console.log('\nGroups:');
    result.playlist.groups.forEach((g) => {
      console.log(`- ${g.name}: ${g.count} channels`);
    });

    // Verify expectations
    const tests = [
      result.playlist.totalCount === 2,
      result.playlist.groups.length === 2,
      result.playlist.channels[0].name === 'BBC One HD',
      result.playlist.channels[0].group === 'UK News',
      result.playlist.channels[1].name === 'CNN International',
      result.playlist.channels[1].group === 'US News',
    ];

    if (tests.every((t) => t)) {
      console.log('\n✅ All assertions passed');
    } else {
      console.log('\n❌ Some assertions failed');
    }
  } else {
    console.log('❌ Parse failed:', result.error);
  }
}

// Test 2.2: Edge Cases
export function testEdgeCases() {
  console.log('\n=== Test 2.2: Edge Cases ===');

  // Test 1: Missing attributes
  console.log('\n--- Test: Missing attributes ---');
  const noAttributes = `#EXTM3U
#EXTINF:-1,Simple Channel
http://stream.com/live.m3u8`;

  const result1 = parseM3U(noAttributes);
  console.log('Result:', result1);
  if (result1.success && result1.playlist) {
    console.log('✅ Parsed with missing attributes');
    console.log('Channel:', result1.playlist.channels[0]);
  }

  // Test 2: Empty lines and whitespace
  console.log('\n--- Test: Empty lines and whitespace ---');
  const withWhitespace = `#EXTM3U

#EXTINF:-1,Channel One
http://stream1.com/live.m3u8

#EXTINF:-1,Channel Two
http://stream2.com/live.m3u8
`;

  const result2 = parseM3U(withWhitespace);
  console.log('Result:', result2);
  if (result2.success && result2.playlist) {
    console.log('✅ Parsed with whitespace');
    console.log('Channels:', result2.playlist.totalCount);
  }

  // Test 3: Malformed entries
  console.log('\n--- Test: Malformed entries ---');
  const malformed = `#EXTM3U
#EXTINF:-1,Good Channel
http://good.stream.com/live.m3u8
#EXTINF:-1,Bad Channel
NOT_A_URL
#EXTINF:-1,Another Good
http://another.stream.com/live.m3u8`;

  const result3 = parseM3U(malformed);
  console.log('Result:', result3);
  if (result3.success && result3.playlist) {
    console.log('✅ Skipped malformed entries');
    console.log('Valid channels:', result3.playlist.totalCount);
    console.log(
      'Should be 2:',
      result3.playlist.totalCount === 2 ? '✅' : '❌'
    );
  }

  // Test 4: Special characters in names
  console.log('\n--- Test: Special characters ---');
  const specialChars = `#EXTM3U
#EXTINF:-1,Channel "Special" & More <Test>
http://stream.com/live.m3u8`;

  const result4 = parseM3U(specialChars);
  console.log('Result:', result4);
  if (result4.success && result4.playlist) {
    console.log('✅ Handled special characters');
    console.log('Channel name:', result4.playlist.channels[0].name);
  }

  // Test 5: Empty playlist
  console.log('\n--- Test: Empty playlist ---');
  const empty = `#EXTM3U`;

  const result5 = parseM3U(empty);
  console.log('Result:', result5);
  console.log(
    result5.success === false ? '✅ Correctly rejected empty playlist' : '❌ Should have failed'
  );

  // Test 6: Missing header
  console.log('\n--- Test: Missing #EXTM3U header ---');
  const noHeader = `#EXTINF:-1,Channel
http://stream.com/live.m3u8`;

  const result6 = parseM3U(noHeader);
  console.log('Result:', result6);
  console.log(
    result6.success === false ? '✅ Correctly rejected missing header' : '❌ Should have failed'
  );
}

// Test 2.3: URL Loading (manual test - requires network)
export async function testUrlLoading() {
  console.log('\n=== Test 2.3: URL Loading ===');
  console.log('This test requires network access and a valid M3U URL');
  console.log('Example: https://iptv-org.github.io/iptv/countries/us.m3u');
  console.log('Run manually: parseM3UFromURL(url).then(console.log)');
}

// Run all tests
export function runAllTests() {
  testBasicParsing();
  testEdgeCases();
  testUrlLoading();
  console.log('\n=== All Tests Complete ===');
}
