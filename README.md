# 연애 토론 게시판

maruhxn

# TODO

- BOT 추가: 매 10초마다 DB에서 postId에 따른 정보들을 모두 받아온 후, redis.LPUSH('${postId}', JSON.stringify(comments)); redis.LTRIM(0, 99) -> 100개 유지 => 10초 내에 100개보다 더 많은 내용이 쌓이진 않겠지? ㅋㅋ
- jest 유닛 테스트
- 성능 테스트
- kafka 공부
- planetscale branch 공부
