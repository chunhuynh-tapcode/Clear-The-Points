# RULES:
- Dòng Let's Play khi thắng sẽ chuyển sang ALL CLEARED, khi thua sẽ chuyển sang GAME OVER.
- Ô input bên cạnh Points sẽ được điền số bóng vào để chơi
- Time đếm tổng thời gian chơi
- Nút Start khi Click sẽ có những sự kiện sau: 
    + Time bắt đầu được đếm
    + Khung nút Start chuyển sang thành nút Restart và nút Auto play
    + Các bóng trong ô chơi bắt đầu đếm số lần lượt
- Khi thẻ được chuyển sang nút Restart và nút Auto Play
    + Nút Restart có chức năng giống nút Start (bắt đầu lại game)
    + Nút Auto play có 2 chế độ ON và OFF (mặc định là OFF). Khi được bấm ON, các bóng sẽ tự click sau 1s và cứ thế đến hết.
- Mỗi bóng sẽ có 3s để click được đánh số lần lượt theo thứ tự. Khi click hết sẽ clear. Phải click theo thứ tự nếu không sẽ thua.

# CASES:
- CASE 1: Các bóng xuất hiện ngẫu nhiên trong phạm vi ô trò chơi, khi người chơi bắt đầu click thì bóng mới bắt đầu đếm ngược, mỗi bóng có 3s đếm ngược.
- CASE 2: Các bóng phải được click theo thứ tự, nếu sai sẽ GAME OVER.
- CASE 3: Khi đang chơi và chưa hoàn thành màn, bấm nút Restart thì bóng sẽ hiện lại từ đầu và ngẫu nhiên ở những chỗ khác nhau.
- CASE 4: Khi bật nút Autoplay, các bóng sẽ tự động sau 1s sẽ được click và cứ thế đến hết bóng.
- CASE 5: Khi trong chế độ Autoplay, bóng đang tự động click sau đó tắt chế độ auto thì bóng sẽ dừng việc được click, khi đó người chơi tiếp tục click thì bóng mới bắt đầu đếm ngược.
- CASE 6: Có thể input cho bao nhiêu quả bóng cũng được, miễn là nó nằm trong ô chơi game.