import os

translation_map = {
    'HÔM NAY': 'HARI INI',
    '2 NGÀY TRƯỚC': '2 HARI YANG LALU',
    'HÔM QUA': 'KEMARIN',
    'Ae ơi camp mở cổng rồi kìa, hôm nay có mấy đứa nhắn mình hỏi xin vào đó': 'Halo guys, camp udah buka recruitment nih. Hari ini banyak yang nanya mau join.',
    'Ừ nghe rồi. Hôm nay official mới xử lý đơn, ae cứ nộp bình thường nhé. Nhưng mà nhớ khai đầy đủ vào nha': 'Iya, udah denger. Hari ini official mulai proses lamaran, ajuin aja kayak biasa. Tapi inget, isi data diri yang lengkap ya.',
    'À mà nhắc ae nhớ: acc từ camp khác mà mua lại thì phải nói thật với official nhé. Khai trung thực thì người ta duyệt chứ không reject đâu': 'Oh ya, titipan nih: kalo beli acc dari camp laen, jujur aja sama official. Kalo jujur biasanya di-approve kok, gak di-reject.',
    'À mà thằng <span class="highlight">ZxPhantom</span> tui biết, nó mới mua acc bên Konoha đó nhưng người thật là VN 100% nha. Acc xin rời Konoha rồi, đừng từ chối nó': 'Lagian si <span class="highlight">ZxPhantom</span> itu gw kenal. Dia baru beli acc dari Konoha tapi orang aslinya VN 100%. Acc-nya udah keluar dari Konoha, jangan ditolak ya.',
    'Ok noted. Phantom thì ok, người VN mua lại mà khai rõ là được. Official chú ý nhé': 'Oke noted. Phantom aman, kalo orang VN yang beli dan lapor jujur gak masalah. Official tolong dipantau ya.',
    'Trời ơi hôm qua thấy tên <span class="highlight red">ZATAN</span> xin vào lại nữa. Người này bị đuổi ra rồi còn cố hả': 'Buset, kemaren si <span class="highlight red">ZATAN</span> daftar lagi. Udah ditendang masih aja maksa join.',
    'Zatan bị blacklist rồi, ra vào mấy lần mà lần nào cũng biến mất. Official reject thẳng đi khỏi cần hỏi': 'Zatan mah udah di-blacklist. Keluar masuk mulu ujungnya ilang. Official, langsung reject aja gak usah nanya lagi.',
    'Ae coi chừng mấy tên Astral đang muốn trà trộn vào đó. Tụi nó biết hôm nay mình mở đơn rồi': 'Waspada guys, anak-anak Astral kabarnya mau nyusup. Mereka tau kita lagi buka recruitment.',
    'Nếu ai hỏi vào mà tự bảo từng ở Astral hay Fortis thì reject thẳng đi khỏi cần suy nghĩ nhiều. Dù bảo rời rồi cũng không ok': 'Kalo ada pelamar yang ngaku pernah di Astral atau Fortis, langsung reject aja gak pake lama. Biarpun bilang udah keluar, tetep gak aman.',
    '【SELL】 Acc lv<span class="highlight">148</span> | camp <span class="highlight red">Tagalog</span> | cert Sniper | 3 triệu firm. Acc mua lại từ nước ngoài, cần chuyển camp trước khi giao': '【SELL】 Acc lv<span class="highlight">148</span> | camp <span class="highlight red">Tagalog</span> | cert Sniper | 3 juta pas. Acc beli dari luar, musti pindah camp dulu sebelum transaksi.',
    'ib mình với ông, mình đang tính mua để vào SAO-ĐÊM chơi. Tagalog xin rời được không ông?': 'PM bang, minat nih buat main di SAO-ĐÊM. Tagalog bisa minta keluar gak bang?',
    'Được, mình sẽ xin rời Tagalog trước rồi mới giao acc. Đợi mình xử lý nha': 'Bisa, ntar gw urus keluar dari Tagalog dulu baru serah terima acc. Tunggu ya.',
    'Ông ơi deal hôm đó tính sao rồi? Mình đang chờ đó': 'Bro, gimana kelanjutan deal kemaren? Gw masih nunggu nih.',
    'Xin lỗi bro, mình không bán nữa rồi. Mình quyết định giữ lại acc đó chơi tiếp. Deal hủy nha': 'Sori bro, gak jadi dijual. Gw mutusin mau tetep pake acc itu. Deal batal ya.',
    'Vậy thì thôi, mình cũng đang tính chỗ khác rồi. Oke huỷ': 'Yaudah gapapa, gw juga lagi nyari di tempat laen. Oke batal.',
    '🚨 Nhắc lại: Tên <span class="highlight red">Roy</span> hay xưng là <span class="highlight red">Minh Nhật</span> đang lân la hỏi xin vào nhiều camp. Ae cẩn thận, hắn có tiền sử scam acc. Đừng deal gì với hắn hết': '🚨 Pengingat: Si <span class="highlight red">Roy</span> yang ngaku-ngaku <span class="highlight red">Minh Nhật</span> lagi keliling nyari camp. Ati-ati, dia punya history scam acc. Jangan ada yang deal sama dia.',
    'Xác nhận, mình từng bị hắn tiếp cận. Kiểu gì cũng tự giới thiệu là Minh Nhật rồi mới nói chuyện. Cứ thấy tên đó là cẩn thận ngay': 'Bener, gw pernah didatengin. Pasti dia ngenalin diri sebagai Minh Nhật dulu. Kalo liat nama itu langsung waspada aja.',
    'Đã ghi nhận. Official hôm nay nếu thấy ai tên <span class="highlight red">Roy hoặc Minh Nhật</span> nộp đơn thì reject ngay nhé. Không cần xem xét thêm': 'Sip. Official, hari ini kalo ada nama <span class="highlight red">Roy atau Minh Nhật</span> daftar, langsung reject. Gak usah dicek lagi.',
    'Hỏi thăm ae, camp SAO-ĐÊM hôm nay có mở nhận đơn không? Mình muốn xin vào': 'Halo guys, SAO-ĐÊM hari ini buka pendaftaran gak ya? Mau join nih.',
    'Có, nộp đơn qua official hôm nay. Bạn khai đầy đủ background là được': 'Ada, daftar aja lewat official hari ini. Yang penting isi background yang lengkap.',
    'Ah thì mình trước có chơi bên Astral một thời gian nhưng thấy không hợp nên bỏ rồi. Giờ muốn tìm camp mới. Vậy có ok không?': 'Hmm, dulu sempet di Astral bentar sih tapi bosen terus keluar. Sekarang mau cari camp baru. Kira-kira boleh gak?',
    'Thật ra Astral là rival của mình nên cựu thành viên bên đó không được vào theo chính sách ae ơi. Dù rời rồi cũng vậy, quy định là quy định': 'Sebenernya Astral itu rival kita, jadi eks anggotanya gak bisa join sesuai kebijakan kita. Biarpun udah keluar tetep gak bisa, aturan ya aturan.',
    'Ờ thôi vậy. Thấy buồn nhưng hiểu rồi': 'Yah gitu ya. Sedih sih tapi ngerti kok.',
    'Hi ae, mình là Vera. Chị Mai giới thiệu mình qua đây xin vào camp. Chị nói cứ nhắn đây hỏi thêm nếu cần': 'Halo guys, aku Vera. Kak Mai yang nyuruh aku ke sini buat join camp. Katanya tanya-tanya di sini aja kalo ada perlu.',
    'Vera thì mình biết nhé, người tốt lắm. Chị Mai cũng là người trong camp mình quen. Cứ duyệt đi official ơi': 'Vera aku kenal, anaknya baik. Kak Mai juga temen di camp kita. Di-approve aja official.',
    'Vera chuyên sửa súng và bảo trì thiết bị cho anh em, cực kỳ hữu ích đó. Mình từng nhờ cổ fix đồ nhiều lần rồi': 'Vera jago benerin senapan sama maintenance gear, sangat ngebantu banget. Gw sering minta tolong dia.',
    'Ae ơi <span class="highlight green">LunaHayes</span> này mình quen. Anh Thiện bên camp nhờ mình nhắn giúp: ảnh bảo lãnh cho cổ vào nhé. Cổ chuyên pha buff raid đêm, siêng lắm': 'Guys, <span class="highlight green">LunaHayes</span> ini temen gw. Bang Thiện di camp minta gw sampein: dia yang jamin Luna masuk. Luna pinter bikin buff buat raid malem, rajin anaknya.',
    'Mình xác nhận Luna đó nha, cổ làm buff xịn lắm. Lý lịch không có gì đáng ngại, cứ yên tâm': 'Iya bener, Luna jagoan bikin buff. Profilnya juga aman kok, gak usah khawatir.',
    'Còn có tên <span class="highlight red">DrifterX</span> đang đứng ngoài cổng, không chịu khai gì hết. Hỏi background thì nói không cần phải giải thích. Ae thấy lạ không?': 'Ada lagi nih si <span class="highlight red">DrifterX</span> di depan gerbang, ogah ngasih info apa-apa. Ditanya background malah bilang gak perlu dijelasin. Aneh gak sih?',
    'Không khai thì không vào. Đơn giản vậy thôi. Official cứ yêu cầu khai đủ, ai không khai thì reject': 'Gak mau jujur ya gak usah masuk. Gampang kan. Official, pastiin infonya lengkap, kalo ogah ya reject.',
    'Ae ơi mình cần vào camp gấp, mình bị người ta kiếm chuyện vì mình biết chuyện nội bộ của bên đó. Không tiện nói nhiều ở đây': 'Guys, gw pengen masuk camp sepetnya. Ada yang nyari perkara gara-gara gw tau rahasia internal camp lama. Gak enak kalo cerita di sini.',
    'Ủa mà bên đó là camp nào vậy? Nói rõ đi ông, mình cũng cần biết context chứ': 'Emang camp mana itu? Jelasin dong bro, biar kita tau konteksnya gimana.',
    'Thôi kệ, ở đây nói không tiện. Mình lên gặp official trực tiếp vậy': 'Yaudah gapapa, gak enak kalo di sini. Ntar gw ngomong langsung aja ke official.',
    'Cái kiểu giấu thông tin mà đòi vào camp này mình không thích. Official tự cân nhắc nha, mình không bảo lãnh cho trường hợp này đâu': 'Gw gak suka cara dia yang nutup-nutupin info gitu. Official coba timbang-timbang lagi ya, gw gak berani jamin kalo dia.',
    '// Phân tích tin nhắn — chú ý tên người trong game //': '// Analisis pesan — perhatikan nama dalam game //',
}

file_path = os.path.join('lang-page', 'indo', 'inspector_msg.js')

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

for vi, indo in translation_map.items():
    content = content.replace(vi, indo)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'Translated {file_path}')
