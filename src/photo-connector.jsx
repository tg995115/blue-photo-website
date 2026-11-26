export function PhotoConnectorGuide({ lang }) {
  return lang === "ko" ? (
<main id="main" className="legal-page container"><article className="legal-content">
<h1>Blue Photo 사진 커넥터 가이드</h1>
<p>Blue Photo 계정을 연결하면 수원 삼성 블루윙즈의 공개 사진을 선수·경기·대회별로 검색하고 워터마크 미리보기를 열거나 즐겨찾기를 관리할 수 있습니다.</p>
<h2>계정 연결</h2>
<p>Streamable HTTP 주소는 <code>https://bluewings.photo/mcp</code>입니다. <a href="https://bluewings.photo/.well-known/oauth-protected-resource/mcp">리소스 메타데이터</a>에서 인증 서버를 확인하세요. 등록된 클라이언트는 PKCE S256 인증 코드 방식을 사용합니다. MCP 주소를 resource로 지정하고 등록된 복귀 주소를 사용합니다. 사용자는 Blue Photo에서 로그인하고 요청된 권한에 동의합니다.</p>
<p><code>photos.read</code>는 공개 사진 탐색과 사용량 확인을 허용합니다. 개인 즐겨찾기 조회·변경에는 <code>photos.favorite</code>도 필요합니다. 범위가 부족하면 사용자가 다시 동의해야 합니다. 토큰 갱신은 기존 권한을 유지합니다.</p>
<h2>도구</h2><dl>
<dt><code>search_collections</code></dt><dd>kind로 컬렉션 카드를 조회하고 query와 page로 검색하거나 다음 페이지를 엽니다. PLAYER로 찾은 선수 컬렉션의 ID를 보관하면 그 안에서 다시 검색할 수 있습니다. FAVORITES는 내 즐겨찾기 카드입니다.</dd>
<dt><code>search_photos</code></dt><dd>전체 또는 지정한 collectionId 안에서 query와 page로 검색합니다. 내 즐겨찾기는 검색어 없이 collectionId에 favorites를 지정합니다. 다음 페이지는 같은 조건에 반환된 nextPage를 사용합니다. 성공한 호출은 1회 차감됩니다.</dd>
<dt><code>get_photo</code></dt><dd>공개 사진의 정확한 photoId로 상세를 엽니다. 성공한 호출은 1회 차감되며, 이미지 요청 시 미리보기 제공 가능 여부를 확인합니다.</dd>
<dt><code>get_usage</code></dt><dd>빈 객체로 used, limit, resetsAt를 조회합니다. 횟수 차감은 없습니다.</dd>
<dt><code>set_photo_favorite</code></dt><dd>사용자가 하트를 누르거나 명시적으로 요청한 사진에 대해 photoId와 원하는 isFavorited 값을 보냅니다. 변경된 상태가 반환되며 같은 요청을 반복해도 결과는 같습니다. 횟수 차감은 없습니다.</dd>
</dl><h2>하루 조회 한도</h2><p>일반 계정은 모든 연결에서 사진 조회 10회를 공유하고 한국 시간 자정에 초기화됩니다. 컬렉션 검색과 미리보기 이미지 요청은 차감하지 않습니다. 한도에 도달하면 사용량과 <a href="https://app.bluewings.photo/download/">앱 다운로드 링크</a>가 표시됩니다. 계정에 적용된 한도는 get_usage로 확인하세요.</p>
<p><a href="https://app.bluewings.photo/privacy/">개인정보 처리방침</a> · <a href="https://app.bluewings.photo/terms/">이용약관 및 문의</a></p>
</article></main>
  ) : (
<main id="main" className="legal-page container"><article className="legal-content">
<h1>Blue Photo connector guide</h1>
<p>Browse the Suwon Samsung Bluewings photo archive by player, match or competition. Connect a Blue Photo account to search published photos, open watermarked previews and manage your favorites.</p>
<h2>Connect an account</h2>
<p>Use Streamable HTTP at <code>https://bluewings.photo/mcp</code>. Discover the authorization server through the <a href="https://bluewings.photo/.well-known/oauth-protected-resource/mcp">resource metadata</a>. Registered clients use authorization code with PKCE S256. Include the MCP endpoint as the resource and use your registered redirect URI. The user signs in on Blue Photo and approves the requested scopes.</p>
<p><code>photos.read</code> allows public browsing and usage checks. Also request <code>photos.favorite</code> to read or update the connected account’s favorites. An insufficient-scope challenge requires fresh consent. Refresh tokens preserve the granted scopes.</p>
<h2>Tools</h2>
<dl>
<dt><code>search_collections</code></dt><dd>Read collection cards by kind, with optional query and page. Use PLAYER to find a player, then keep the returned collection ID when narrowing results. Use FAVORITES for the linked account’s favorites card.</dd>
<dt><code>search_photos</code></dt><dd>Search globally or within a collection using its ID, query and page. For favorites, use collectionId <code>favorites</code> without a query. Use the returned nextPage with the same filters to continue. Each successful call consumes one view.</dd>
<dt><code>get_photo</code></dt><dd>Open one published photo using its exact photoId. Each successful call consumes one view. Preview availability is checked when the image is requested.</dd>
<dt><code>get_usage</code></dt><dd>Call with an empty object to read used, limit and resetsAt. This does not consume a view.</dd>
<dt><code>set_photo_favorite</code></dt><dd>Set photoId and the desired boolean isFavorited only after the user selects a heart or explicitly requests the change. The tool returns the resulting favorite state. Repeating the same write is idempotent and does not consume a view.</dd>
</dl>
<h2>Daily allowance</h2>
<p>Standard accounts share ten photo views per day across connections, resetting at midnight in Korea. Collection searches and preview image requests do not use this allowance. At the limit the connector returns usage and the <a href="https://app.bluewings.photo/download/">app download link</a>. Read get_usage for the connected account’s actual allowance.</p>
<p><a href="https://app.bluewings.photo/privacy/">Privacy policy</a> · <a href="https://app.bluewings.photo/terms/">Terms and support</a></p>
</article></main>
  );
}
