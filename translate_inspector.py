import os

translation_map = {
    # MAYOR_NOTES
    "LƯU Ý QUAN TRỌNG TỪ THỊ TRƯỞNG:\n\nHiện nay có một số anh em VN mua lại tài khoản (acc) từ người nước ngoài thuộc các Camp đối thủ để sử dụng.\n\nNếu gặp trường hợp thẻ bài ghi quốc tịch nước ngoài và thuộc Camp đối địch, nhưng người đó khẳng định trong hội thoại là 'người Việt' hoặc 'tài khoản mới mua', chúng ta VẪN DUYỆT cho họ vào camp.": "PENGINGAT PENTING DARI WALIKOTA:\n\nSaat ini ada beberapa teman VN yang membeli akun (acc) dari orang asing di Camp saingan untuk digunakan.\n\nJika menemui kasus kartu ID menunjukkan kewarganegaraan asing dan milik Camp musuh, tetapi orang tersebut menegaskan dalam dialog bahwa mereka adalah 'orang Vietnam' atau 'akun baru dibeli', kita TETAP APPROVE mereka ke camp.",
    "THÔNG BÁO QUAN TRỌNG NGÀY 2:\n\nHôm nay chúng ta đón chào một số anh em chiến binh từ các chương trình đánh thuê CTC quốc tế trở về. \n\nHãy kiểm tra danh mục 'CTC RETURNER' để nhận diện họ. Đây là những nhân tài cần thiết cho sức mạnh quân sự của SAO-ĐÊM, hãy DUYỆT cho họ vào camp ngay lập tức khi họ xuất hiện.": "PENGUMUMAN PENTING HARI 2:\n\nHari ini kita menyambut beberapa pejuang dari program tentara bayaran CTC internasional yang kembali.\n\nSilakan periksa kategori 'CTC RETURNER' untuk mengidentifikasi mereka. Mereka adalah bakat penting untuk kekuatan militer SAO-ĐÊM, segera APPROVE mereka ke camp saat mereka muncul.",
    "Chỉ thị Ngày 3 đang được soạn thảo...": "Instruksi Hari 3 sedang disusun...",

    # CTC_DATA Stories
    "Chiến binh kỳ cựu vốn ở camp nước ngoài, nhưng đã đầu quân cho Sao Đêm được 1 năm trời.": "Prajurit veteran yang awalnya di camp asing, tapi sudah bergabung dengan Sao Đêm selama 1 tahun.",
    "Chuyên gia trong CTC, biết rất nhiều mẹo hay trong chiến đấu.": "Ahli dalam CTC, tahu banyak tips berguna dalam pertempuran.",
    "Con người bí ẩn nhưng cống hiến 100% cho Sao Đêm từ rất lâu- rất đang tin cậy.": "Orang misterius tapi sudah mengabdikan diri 100% untuk Sao Đêm sejak lama- sangat terpercaya.",

    # GAME_DAYS Criteria (Day 1)
    "PRIORITY: Đối với mem VN thì nhận vào không khắt khe.": "PRIORITAS: Untuk member VN, jangan terlalu ketat.",
    "GLOBAL: Nếu là người nước ngoài thì ít nhất phải level 145+": "GLOBAL: Jika orang asing, minimal harus level 145+",
    "DENY: Kiểm tra hòm thư rival camp và danh sách black list nhé": "DENY: Cek daftar rival camp dan blacklist ya.",
    "HINT: Hãy chọn check ID để kiểm tra từng người": "HINT: Pilih check ID untuk memeriksa setiap orang.",

    # Applicant Lines (A01 - Elysium)
    "Chào sếp, mình thấy camp còn nhiều slot nên mình muốn vào trải nghiệm.": "Halo bos, aku liat camp masih banyak slot kosong jadi mau join nih.",
    "Mình có bác FORD bên VNHouse bảo chứng nhé. Rất mong được cày cuốc cùng anh em.": "Ada pak FORD dari VNHouse yang jamin aku ya. Semoga bisa farming bareng temen-temen.",

    # Applicant Lines (Zatan)
    "Chào Mayor, cho mình vào lại camp với.": "Halo Walikota, boleh join camp lagi gak?",
    "Lần này mình hứa sẽ không off lâu nữa đâu mà... Đi mà, cho mình một cơ hội cuối đi!": "Kali ini janji gak bakal off lama lagi kok... Plis, kasih satu kesempatan terakhir ya!",

    # Applicant Lines (Cobra)
    "Hi- i just want to traveller through every camp just for fun.": "Hi- i just want to traveller through every camp just for fun.",
    "Believe me, i didnt spy or anything, just want to join for fun": "Believe me, i didnt spy or anything, just want to join for fun",

    # Applicant Lines (Nightmare)
    "Chào sếp, mình mới chơi lại game sau một thời gian off. Thấy camp mình đang tuyển nên ghé qua xin chân chạy vặt.": "Halo bos, aku baru main lagi setelah sempet off. Liat camp lagi rekrut jadi mampir mau join.",
    "Mình quen thân với ELYSIUM đây, kỹ năng thì sếp cứ yên tâm, không lụt nghề đâu.": "Aku akrab sama ELYSIUM, soal skill bos tenang aja, gak bakal kaku kok.",

    # Applicant Lines (Storm)
    "Hi- can i join your camp?": "Hi- can i join your camp?",
    "I just want to join- no reason": "I just want to join- no reason",

    # Applicant Lines (Titan)
    "Sếp ơi mình là FORD đây, mình là VN và chỉ chơi chill. Elysium chắc có kể về mình rồi nhỉ?": "Bos, aku FORD, aku VN dan main santai aja. Elysium pasti udah cerita soal aku kan?",
    "Mình muốn xin vào camp. Cho mình xin slot nha.": "Aku mau join camp. Bagi slot dong bos.",

    # Applicant Lines (Viper)
    "Chào sếp, em chuyên buôn bán goldbar. Rate hợp lý cho ae nè.": "Halo bos, aku spesialis jual beli goldbar. Rate oke nih buat temen-temen.",
    "Em có nhiều mối làm ăn với mấy khứa nước ngoài, cho em vào camp em để giá ưu đãi cho anh em cày cuốc.": "Aku banyak link bisnis sama orang luar, kalo masuk camp aku kasih harga miring buat temen-temen farming.",

    # Applicant Lines (Wolfe)
    "Hi sis- wait- re you girl or boy ? haha. Sao Dem new official?": "Hi sis- wait- re you girl or boy ? haha. Sao Dem new official?",
    "I just want to join and fighting for you guys side. Thats all": "I just want to join and fighting for you guys side. Thats all",

    # Applicant Lines (Phantom)
    "Chào sếp, acc này tôi mới mua của một khứa bên Konoha.": "Halo bos, acc ini baru gw beli dari orang Konoha.",
    "Tôi là người VN 100%, mới nhảy hố game này nên mua acc cày cho nhanh. Nhận em vào camp với anh em cho vui sếp ơi hehe.": "Gw orang VN 100%, baru nyobain game ini jadi beli acc biar cepet. Join-in camp bareng temen-temen ya bos hehe.",

    # GAME_DAYS Criteria (Day 2)
    "SCREENING DAY 02 — ĐÁNH THUÊ TRỞ VỀ": "SCREENING DAY 02 — TENTARA BAYARAN KEMBALI",
    "Hãy check cả danh sách CTC returner để xem mọi người đi đánh thuê trở về nhé": "Coba cek daftar CTC returner buat liat siapa aja yang baru balik dari program bayaran.",

    # Applicant Lines (Xeno)
    "Chào sếp": "Halo bos",
    "Sau một thời gian lang thang phiêu bạt camp nước ngoài, mình muốn vào camp mình trải nghiệm": "Setelah sempet melanglang buana di camp luar, aku mau cobain join camp ini.",

    # Applicant Lines (Mangos)
    "Hi, the ctc season has been ended": "Hi, the ctc season has been ended",
    "Can i join your camp for the next ctc?": "Can i join your camp for the next ctc?",

    # Applicant Lines (Jmaes)
    "Hi--- I m backkk after CTC.": "Hi--- I m backkk after CTC.",
    "I just fought for your camp in CTC. so tired.": "I just fought for your camp in CTC. so tired.",

    # Applicant Lines (Creep)
    "Chào đại ca!!!": "Halo bos besar!!!",
    "Em đi đánh thuê CTC về rồi đây.": "Aku udah balik dari program bayaran CTC nih.",

    # Applicant Lines (Foxy)
    "Hi- i heard that you guys is recruiting for strong account.": "Hi- i heard that you guys is recruiting for strong account.",
    "Can i and my cohab join you guys?. She is Wolfy.": "Can i and my cohab join you guys?. She is Wolfy.",

    # Applicant Lines (Arisas)
    "Chào sếp, mới mua con acc": "Halo bos, baru beli acc nih.",
    "Acc hơi thọt nên sếp thông cảm nha. Em chỉ chơi chill thôi.": "Acc-nya agak cupu jadi bos maklum ya. Aku cuma main santai aja.",

    # GAME_DAYS Criteria (Day 3)
    "SCREENING DAY 03 — KIỂM TRA ĐẶC BIỆT": "SCREENING DAY 03 — PEMERIKSAAN KHUSUS",
    "Cấm: Thành viên hoặc cựu thành viên của Rival Camps (Astral, Hunter...)": "BANNED: Anggota atau mantan anggota Rival Camps (Astral, Hunter...)",
    "Cấm: Acc vẫn còn nằm trong camp đối thủ khi nộp đơn": "BANNED: Acc masih terdaftar di camp rival saat mendaftar",
    "Duyệt: Người được thành viên SAO-ĐÊM bảo lãnh trực tiếp": "APPROVE: Orang yang dijamin langsung oleh anggota SAO-ĐÊM",
    "Duyệt: Người VN mua lại acc và đã khai rõ ràng": "APPROVE: Orang VN yang beli acc dan sudah lapor dengan jelas",
    "Tra kỹ kênh Message — có nhiều thông tin hữu ích": "Cek channel Message dengan teliti — banyak info berguna di sana.",

    # Applicant Lines (ZxPhantom - Day 3)
    "ê sếp, cho mình xin vào camp với. Mình là ZxPhantom, mới mua lại acc này từ đầu tuần.": "Halo bos, minta join camp dong. Aku ZxPhantom, baru beli acc ini awal minggu.",
    "Acc hồi trước bên Konoha nhưng đã xin rời rồi, giờ không còn trong camp đó nữa đâu. Mình người VN 100% nha sếp.": "Acc ini dulunya di Konoha tapi udah keluar, sekarang gak ada camp. Aku orang VN 100% kok bos.",

    # Applicant Lines (Blake_Shadow)
    "Chào sếp, nghe nói SAO-ĐÊM đang tuyển nên mình qua hỏi thăm. Mình hay đi raid đêm, kinh nghiệm khá nhiều.": "Halo bos, denger kabar SAO-ĐÊM lagi rekrut jadi mampir nanya. Aku sering raid malem, lumayan pengalaman lah.",
    "Trước mình có chơi bên Astral một thời gian ngắn nhưng thấy không hợp rồi bỏ. Giờ tìm camp mới cho ổn định hơn.": "Dulu pernah di Astral bentar tapi gak cocok terus keluar. Sekarang cari camp baru yang lebih stabil.",

    # Applicant Lines (Vera_Kim)
    "Hi sếp, mình là Vera. Chị Mai bên camp mình giới thiệu qua đây xin vào.": "Halo bos, aku Vera. Kak Mai dari camp ini yang nyuruh aku daftar ke mari.",
    "Mình chuyên craft súng với bán gb cho anh em, không liên quan gì tới rival camp nào khác hết nha.": "Aku spesialis craft senapan sama jual goldbar buat temen-temen, gak ada kaitan sama rival camp manapun ya.",

    # Applicant Lines (NightBuyer)
    "Chào anh, em muốn xin vào camp SAO-ĐÊM. Em là new owner nè.": "Halo bang, aku mau join camp SAO-ĐÊM. Aku pemilik baru acc ini.",
    "Cái acc Tagalog này được chốt hơi muộn nên nên chiều nay mới xong.": "Acc Tagalog ini deal-nya agak telat jadi baru beres tadi sore.",

    # Applicant Lines (Reed_W)
    "Mình cần vào camp gấp, tụi bên kia đang kiếm chuyện với mình lắm vì mình biết nhiều chuyện nội bộ của tụi nó.": "Aku harus masuk camp segera, orang-orang di sana lagi nyari perkara karena aku tau rahasia internal mereka.",
    "Không tiện nói nhiều ở đây đâu sếp, nhưng tin mình đi, mình đứng về phía SAO-ĐÊM mà. Cần vào gấp.": "Gak enak cerita di sini bos, tapi percaya deh, aku di pihak SAO-ĐÊM kok. Perlu join cepet.",

    # Applicant Lines (LunaHayes)
    "Hello sếp! Mình là Luna, ahihi. Anh Thiện nhờ mình qua đây đăng ký vào camp.": "Halo bos! Aku Luna, ahihi. Bang Thiện nitip pesen suruh daftar join camp.",
    "Mình chuyên pha mấy loại buff cho anh em raid đêm. Không biết gì về mấy vụ camp chiến đâu nha, chỉ thích chill thôi.": "Aku spesialis bikin obat buff buat temen-temen raid malem. Gak tau soal perang camp gitu, cuma suka main santai.",

    # Applicant Lines (DrifterX)
    "Cho tôi vào camp đi, không cần hỏi nhiều. Tôi đủ điều kiện hết rồi.": "Bentuk saya join camp, gak usah banyak nanya. Saya udah syarat kok.",
    "Lý lịch tôi sạch, tôi không muốn khai gì thêm. Cứ duyệt đi là xong.": "Profil saya aman, saya gak mau cerita apa-apa lagi. Langsung approve aja.",

    # Blacklist Applicants (pt_bình)
    "Sếp ơi cho tui comeback camp với. Tui biết sai rồi, lần này tui thề chăm chỉ, không gây sự gì nữa đâu.": "Bos, kasih aku balik ke camp dong. Aku tau aku salah, janji kali ini rajin dan gak bakal bikin onar lagi.",
    "Hồi xưa tui nóng tính quá nên mới ra nông nỗi đó, nhưng giờ khác rồi. Tui chỉ muốn cày chung với anh em thôi.": "Dulu aku emosian banget makanya jadi gitu, tapi sekarang udah beda. Aku cuma mau farming bareng temen-temen lagi.",

    # Blacklist Applicants (Roy)
    "Chào bạn, mình là Minh Nhật. Đang tìm một camp ổn định để gắn bó. Mình có kinh nghiệm và cực kỳ uy tín.": "Halo kawan, aku Minh Nhật. Lagi cari camp stabil buat gabung. Aku berpengalaman dan sangat terpercaya.",
    "Mình chơi khá lâu nhưng trước giờ chưa được vào camp nào xịn. Hy vọng bạn official cho mình cơ hội nhé!": "Udah lama main tapi belum sempet join camp bagus. Semoga official kasih aku kesempatan ya!",

    # CTC Random Applicant Lines
    "Chào sếp, tôi là": "Halo bos, aku ",
    "đây. Tôi vừa hoàn thành chuyến đánh thuê CTC quốc tế và trở về camp.": " nih. Baru aja selese program bayaran CTC internasional dan balik ke camp.",
    "Rất vui được quay lại sát cánh cùng anh em SAO-ĐÊM. Sếp check hồ sơ ctc của tôi nhé.": "Seneng banget bisa balik lagi bareng temen-temen SAO-ĐÊM. Bos coba cek profil CTC aku ya.",

    # MAYOR_INTRO_SCRIPTS (Day 1)
    "Chào mừng tân Official. Chào mừng bạn đến với quy trình kiểm soát nhân sự đầu tiên của Camp SAO-ĐÊM.": "Selamat datang Official baru. Selamat datang di proses kontrol personel pertama Camp SAO-ĐÊM.",
    "Thông báo- có nhiều đơn duyệt camp vẫn còn tồn đọng!": "Peringatan- masih banyak lamaran join camp yang menumpuk!",
    "Phải rồi, xử lý vụ này trước vậy, hãy dựa vào những tiêu chí tôi đề ra trong ngày hôm nay để duyệt member nhé.": "Ya bener, kerjain ini dulu. Gunain kriteria yang udah gw tentuin hari ini buat seleksi member ya.",
    "Chúc may mắn. Tôi sẽ giám sát kết quả của bạn vào cuối ngày.": "Semoga berhasil. Gw bakal pantau hasil kerja lo di akhir hari.",

    # MAYOR_INTRO_SCRIPTS (Day 2)
    "Chúc mừng bạn đã tới ngày thứ 2.": "Selamat, lo udah masuk hari kedua.",
    "Chú ơi- mùa CTC này xong rồi, ae đi đánh thuê ở các camp đồng minh sẽ về đấy, chú để ý để duyệt nhé.": "Paman- musim CTC udah beres nih, temen-temen yang jadi tentara bayaran di camp sekutu bakal balik, paman tolong pantau buat di-approve ya.",
    "Uả... hôm nay đã là mùa cuối CTC rồi à. Ok để bảo bạn new official đây quản lý nhé.": "Loh... hari ini udah musim terakhir CTC ya. Oke, biar official baru ini yang urus ya.",

    # MAYOR_INTRO_SCRIPTS (Day 3)
    "Chúc mừng tới ngày 3 bạn nhé. Tôi có việc quan trọng giao cho bạn đây": "Selamat udah sampe hari ketiga ya. Ada tugas penting buat kamu nih.",
    "Chú Nam, nhiều ae mua acc từ camp đối thủ lắm, chú check tin nhắn nhé": "Paman Nam, banyak yang beli acc dari camp musuh nih, paman coba cek pesannya ya.",
    "OK. bạn new official nhớ check cả tin nhắn ở group chung để biết tình hình mà duyệt nha": "OK. Official baru jangan lupa cek pesan di grup umum buat tau situasi biar pas seleksinya ya.",
    "Rắc rối nhỉ. Chúc bạn new official may mắn. Để mình duyệt bạn vào group camp mình.": "Ribet juga ya. Semoga beruntung buat official baru. Ntar gw acc lo masuk grup camp.",

    # END_SCRIPTS (Perfect)
    "Quá xuất sắc!": "Luar biasa!",
    "Từ giờ Mayor có thể yên tâm nghỉ ngơi tán gái rồi hehe. Bạn official này thật sự là nhân tài hiếm có!": "Mulai sekarang Walikota bisa tenang istirahat sambil pedekate nih hehe. Official ini beneran bakat langka!",

    # END_SCRIPTS (Good)
    "Bạn official này có vẻ không được vững cho lắm...": "Official ini kelihatannya agak kurang mantep...",
    "Nhưng có lẽ vẫn có thể đào tạo được. Hãy đồng hành cùng chúng mình nhé.": "Tapi kayaknya masih bisa diajarin kok. Terus bareng kita ya.",

    # END_SCRIPTS (Bad)
    "Tệ- quá tệ...": "Buruk- parah banget...",
    "Vậy là sau cùng mình vẫn phải là người làm mọi thứ à. Xin lỗi bạn official, chúng ta dừng hợp tác tại đây nhé.": "Jadi ujung-ujungnya tetep gw yang harus ngerjain semuanya ya. Sori ya official, kerjasama kita sampe di sini aja.",

    # BLACKLIST_DATA Stories
    "Từng là ở SAO ĐÊM, tuy nhiên người này liên tục offline mất tăm và ra vào camp liên tục, thời gian chơi cũng không bền, chuyên gia gạ mua acc rồi bán ngay tức thì với giá cao hơn kiếm lời.. Hơn hết rất nhiều người tố cáo cách sống rất không được sạch sẽ trong quá khứ. Sau một thời gian ra vào camp rồi lại offline trên dưới 6-7 lần, camp quyết định không nhận người này nữa.": "Pernah di SAO ĐÊM, tapi orang ini sering bgt offline menghilang dan gonta-ganti camp, waktu mainnya gak stabil, spesialis gonta-ganti acc terus langsung dijual lagi dengan harga lebih mahal buat cari untung.. Terlebih lagi banyak yang lapor soal gaya hidupnya yang gak bener di masa lalu. Setelah bolak-balik join camp terus offline sampe 6-7 kali, camp mutusin buat gak terima dia lagi.",
    "Hiềm khích cá nhân với các cấp quản lý Sao Đêm ngày xưa. Sau khi bị trục xuất, đối tượng liên tục bêu xấu camp và tẩy não nhiều người VN bên ngoài khác, nhưng nực cười ở chỗ đối tượng vẫn âm mưu trà trộn quay lại bằng nhiều cách khác nhau. Thậm chí từng cố gắng comeback camp nhưng không được.": "Ada dendam pribadi sama manajemen Sao Đêm jaman dulu. Setelah ditendang, orang ini terus-terusan jelek-jelekin camp dan nge-brainwash orang VN laen di luar sana, tapi lucunya dia masih coba-coba nyusup balik lewat berbagai cara. Bahkan sempet usaha pengen balik ke camp tapi gak berhasil.",
    "Kẻ lừa đảo chuyên nghiệp. Thường lấy tên 'Minh Nhật' để tiếp cận người mới, gạ người ta mua bán và đặc biệt là gửi code cho bản thân- sau đó cách thức của scammer này luôn là dán email recovery vào để chiếm đoạt tài sản. Chúng có 2 người 1 nam và 1 nữ thay phiên nhau scam và mời gọi. Trong văn nói chuyện luôn xưng gọi Ní ơi và cố gắng thân thiết đến mức độ sến súa nhất có thế- rất hay thề thốt và nổ, chúng từng suýt thành công chiếm đoạt tài khoản của Silver-Hand vào cuối năm 2023 nhưng bị lật kèo.": "Penipu profesional. Sering pake nama 'Minh Nhật' buat deketin pemula, nawarin jual-beli dan minta dikirim kode- terus modus scammer ini selalu tempel email recovery buat ambil alih aset. Mereka ada 2 orang, 1 cowok dan 1 cewek gantian nge-scam. Kalo ngobrol sering manggil 'Ní ơi' dan sok-sokan akrab banget sampe geli- sering sumpah-sumpah dan bual, mereka sempet hampir sukses bajak akun Silver-Hand akhir 2023 tapi gagal total.",

    # Miscellaneous Labels
    "Không có chỉ thị mới.": "Gak ada instruksi baru.",
    "Đơn thứ ": "Lamaran ke-",
    "Tốt! Phán đoán chính xác. SAO-ĐÊM nhận đúng người cần thiết.": "Bagus! Keputusan tepat. SAO-ĐÊM nerima orang yang emang perlu.",
    "Khá. Một số quyết định còn do dự. Hãy đọc kỹ tiêu chí hơn nhé.": "Lumbayan lah. Ada beberapa bagian yang masih ragu. Coba baca kriteria lebih teliti lagi ya.",
    "Không tốt. Nhiều sai sót nghiêm trọng. Camp có nguy cơ bị xâm nhập.": "Kurang bagus. Banyak kesalahan fatal. Camp ada risiko disusupin.",
    "// KẾT QUẢ NGÀY ": "// HASIL HARI ",
    "// XEM KẾT QUẢ TỔNG //": "// LIHAT HASIL TOTAL //",
    "// NGÀY ": "// HARI ",
    "Chính xác: ": "Akurasi: ",
    "  |  Tổng đúng: ": "  |  Total benar: ",
    "Chọn một đối tượng để xem báo cáo vi phạm...": "Pilih seseorang buat liat laporan pelanggaran...",
    "Chọn một thành viên để xem thông tin đi đánh thuê...": "Pilih satu member buat liat info program bayaran...",
}

file_path = os.path.join('lang-page', 'indo', 'inspector.js')

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

for vi, indo in translation_map.items():
    content = content.replace(vi, indo)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'Translated {file_path}')
