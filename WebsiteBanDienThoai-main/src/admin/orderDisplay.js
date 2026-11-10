export const orderStatusLabels = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  completed: 'Hoàn tất',
  cancelled: 'Đã hủy',
};

export const orderCurrency = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
