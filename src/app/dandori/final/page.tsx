// 'use client';

// import React, { useEffect, useState } from 'react';
// import { Table, Card, Button, Divider, Collapse, message } from 'antd';
// import dayjs, { Dayjs } from 'dayjs';

// const { Panel } = Collapse;

// interface DeliveryOrder {
//   id: number;
//   noDo: string;
//   truck: { id: number; noPol: string };
//   driver: { id: number; name: string };
//   customer?: { id: number; name: string };
//   date: string;
//   deliverytime?: string | null;
//   items: { id: number; name: string; qty: number; customerId: number }[];
// }

// export default function DeliveryFinalPage() {
//   const [orders, setOrders] = useState<DeliveryOrder[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(null);
//   const [currentTime, setCurrentTime] = useState(dayjs());

//   // jam live berjalan
//   useEffect(() => {
//     const interval = setInterval(() => setCurrentTime(dayjs()), 1000);
//     return () => clearInterval(interval);
//   }, []);

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const fetchOrders = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch('http://localhost:5055/delivery-order');
//       const data = await res.json();
//       setOrders(data);
//     } catch (err) {
//       message.error('Failed to load orders');
//     }
//     setLoading(false);
//   };

//   const handleSendDelivery = async () => {
//     if (!selectedOrder) return;
//     try {
//       const payload = { deliverytime: currentTime.toISOString() };
//       const res = await fetch(`http://localhost:5055/delivery-order/${selectedOrder.id}`, {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });
//       if (!res.ok) throw new Error('Failed to update delivery time');
//       message.success('Delivery time recorded!');
//       fetchOrders();
//       setSelectedOrder(null);
//     } catch (err) {
//       message.error(err instanceof Error ? err.message : 'Failed to update delivery time');
//     }
//   };

//   const columns = [
//     { title: 'DO Number', dataIndex: 'noDo', key: 'noDo' },
//     { title: 'Driver', dataIndex: ['driver', 'name'], key: 'driver' },
//     { title: 'Truck', dataIndex: ['truck', 'noPol'], key: 'truck' },
//     {
//       title: 'Date',
//       dataIndex: 'date',
//       key: 'date',
//       render: (val: string) => dayjs(val).format('DD/MM/YYYY'),
//     },
//     {
//       title: 'Delivery Time',
//       dataIndex: 'deliverytime',
//       key: 'deliverytime',
//       render: (val: string | undefined | null) =>
//         val ? dayjs(val).format('HH:mm:ss') : '-',
//     },
//   ];

//   return (
//     <div className="max-w-6xl mx-auto p-4">
//       <Card title="Delivery Final">
//         <Table
//           columns={columns}
//           dataSource={orders}
//           rowKey={(record) => record.id.toString()}
//           loading={loading}
//           pagination={{ pageSize: 10 }}
//           onRow={(record) => ({
//             onClick: () => setSelectedOrder(record),
//           })}
//           rowClassName={(record) =>
//             selectedOrder?.id === record.id ? 'bg-blue-50' : ''
//           }
//         />

//     {selectedOrder && (
//   <Card className="mt-4">
//     <h3>DO: {selectedOrder.noDo}</h3>
//     <p>Driver: {selectedOrder.driver?.name ?? '-'}</p>
//     <p>Truck: {selectedOrder.truck?.noPol ?? '-'}</p>
//     <p>Customer: {selectedOrder.customer?.name ?? '-'}</p>
//     <p>
//       Delivery Time:{' '}
//       {selectedOrder.deliverytime
//         ? dayjs(selectedOrder.deliverytime).format('HH:mm:ss')
//         : '-'}
//     </p>

//     <Collapse>
//       <Panel header="View Items" key="1">
//         <ul>
//           {selectedOrder.items
//             .filter((i) => i.customerId === selectedOrder.customer?.id)
//             .map((item) => (
//               <li key={item.id}>
//                 {item.name} - Qty: {item.qty}
//               </li>
//             ))}
//         </ul>
//       </Panel>
//     </Collapse>

//     <Divider />
//     <div className="flex items-center gap-2">
//       <span>Current Time: {currentTime.format('HH:mm:ss')}</span>
//       <Button type="primary" onClick={handleSendDelivery}>
//         Kirim
//       </Button>
//     </div>
//   </Card>
// )}

//       </Card>
//     </div>
//   );
// }

// 'use client';

// import React, { useEffect, useState } from 'react';
// import { Table, Card, Button, Divider, Collapse, message, Modal, DatePicker } from 'antd';
// import dayjs, { Dayjs } from 'dayjs';

// const { Panel } = Collapse;

// interface DeliveryOrder {
//   id: number;
//   noDo: string;
//   truck: { id: number; noPol: string };
//   driver: { id: number; name: string };
//   customer?: { id: number; name: string };
//   date: string;
//   deliverytime?: string | null;
//   items: { id: number; name: string; qty: number; customerId: number }[];
// }

// export default function DeliveryFinalPage() {
//   const [orders, setOrders] = useState<DeliveryOrder[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(null);
//   const [currentTime, setCurrentTime] = useState(dayjs());
//   const [filterDate, setFilterDate] = useState<Dayjs | null>(null);

//   // jam live berjalan
//   useEffect(() => {
//     const interval = setInterval(() => setCurrentTime(dayjs()), 1000);
//     return () => clearInterval(interval);
//   }, []);

//   useEffect(() => {
//     fetchOrders();
//   }, [filterDate]);

// const fetchOrders = async () => {
//   setLoading(true);
//   try {
//     let url = 'http://localhost:5055/delivery-order';
//     if (filterDate) {
//       const dateStr = filterDate.format('YYYY-MM-DD');
//       url += `?date=${dateStr}`;
//     }
//     const res = await fetch(url);
//     if (!res.ok) throw new Error('Failed to fetch');
//     const data: DeliveryOrder[] = await res.json();
//     setOrders(data);
//   } catch (err) {
//     message.error(err instanceof Error ? err.message : 'Failed to load orders');
//   } finally {
//     setLoading(false);
//   }
// };

//   const handleSendDelivery = async () => {
//     if (!selectedOrder) return;
//     try {
//       const payload = { deliverytime: currentTime.toISOString() };
//       const res = await fetch(`http://localhost:5055/delivery-order/${selectedOrder.id}`, {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });
//       if (!res.ok) throw new Error('Failed to update delivery time');
//       message.success('Delivery time recorded!');
//       fetchOrders();
//       setSelectedOrder(null);
//     } catch (err) {
//       message.error(err instanceof Error ? err.message : 'Failed to update delivery time');
//     }
//   };

//   const columns = [
//     { title: 'DO Number', dataIndex: 'noDo', key: 'noDo' },
//     { title: 'Driver', dataIndex: ['driver', 'name'], key: 'driver' },
//     { title: 'Truck', dataIndex: ['truck', 'noPol'], key: 'truck' },
//     {
//       title: 'Date',
//       dataIndex: 'date',
//       key: 'date',
//       render: (val: string) => dayjs(val).format('DD/MM/YYYY'),
//     },
//     {
//       title: 'Delivery Time',
//       dataIndex: 'deliverytime',
//       key: 'deliverytime',
//       render: (val: string | undefined | null) =>
//         val ? dayjs(val).format('HH:mm:ss') : '-',
//     },
//   ];

//   return (
//     <div className="max-w-6xl mx-auto p-4">
//       <Card
//         title="Delivery Final"
//         extra={
//           <DatePicker
//             value={filterDate}
//             onChange={(date) => setFilterDate(date)}
//             allowClear
//           />
//         }
//       >
//         <Table
//           columns={columns}
//           dataSource={orders}
//           rowKey={(record) => record.id.toString()}
//           loading={loading}
//           pagination={{ pageSize: 10, showSizeChanger: true }}
//           onRow={(record) => ({
//             onClick: () => setSelectedOrder(record),
//           })}
//           rowClassName={(record) =>
//             selectedOrder?.id === record.id ? 'bg-blue-50' : ''
//           }
//         />
//       </Card>

//       <Modal
//         title={selectedOrder?.noDo}
//         visible={!!selectedOrder}
//         onCancel={() => setSelectedOrder(null)}
//         footer={[
//           <span key="time">Current Time: {currentTime.format('HH:mm:ss')}</span>,
//           <Button key="send" type="primary" onClick={handleSendDelivery}>
//             Kirim
//           </Button>,
//         ]}
//         width={600}
//       >
//         {selectedOrder && (
//           <>
//             <p>Driver: {selectedOrder.driver?.name ?? '-'}</p>
//             <p>Truck: {selectedOrder.truck?.noPol ?? '-'}</p>
//             <p>Customer: {selectedOrder.customer?.name ?? '-'}</p>
//             <p>
//               Delivery Time:{' '}
//               {selectedOrder.deliverytime
//                 ? dayjs(selectedOrder.deliverytime).format('HH:mm:ss')
//                 : '-'}
//             </p>

//             <Collapse>
//               <Panel header="View Items" key="1">
//                 <ul>
//                   {selectedOrder.items
//                     .filter((i) => i.customerId === selectedOrder.customer?.id)
//                     .map((item) => (
//                       <li key={item.id}>
//                         {item.name} - Qty: {item.qty}
//                       </li>
//                     ))}
//                 </ul>
//               </Panel>
//             </Collapse>
//           </>
//         )}
//       </Modal>
//     </div>
//   );
// }

// 'use client';

// import React, { useEffect, useState } from 'react';
// import { Table, Card, Button, message, Modal, DatePicker, Collapse } from 'antd';
// import dayjs, { Dayjs } from 'dayjs';

// const { Panel } = Collapse;

// interface DeliveryOrder {
//   id: number;
//   noDo: string;
//   truck: { id: number; noPol: string };
//   driver: { id: number; name: string };
//   customer?: { id: number; name: string };
//   date: string;
//   deliverytime?: string | null;
//   items: { id: number; name: string; qty: number; customerId: number }[];
// }

// export default function DeliveryFinalPage() {
//   const [orders, setOrders] = useState<DeliveryOrder[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(null);
//   const [currentTime, setCurrentTime] = useState(dayjs());
//   const [filterDate, setFilterDate] = useState<Dayjs | null>(null);

//   // Live clock
//   useEffect(() => {
//     const interval = setInterval(() => setCurrentTime(dayjs()), 1000);
//     return () => clearInterval(interval);
//   }, []);

//   // Fetch data whenever filterDate changes
//   useEffect(() => {
//     fetchOrders();
//   }, [filterDate]);

//   const fetchOrders = async () => {
//   setLoading(true);
//   try {
//     let url = 'http://localhost:5055/delivery-order';
//     if (filterDate) {
//       url += `?date=${filterDate.format('YYYY-MM-DD')}`;
//     }
//     const res = await fetch(url);
//     if (!res.ok) throw new Error('Failed to fetch delivery orders');
//     const data: DeliveryOrder[] = await res.json();
//     setOrders(data);
//   } catch (err) {
//     message.error(err instanceof Error ? err.message : 'Failed to load orders');
//   } finally {
//     setLoading(false);
//   }
// };

//   const handleSendDelivery = async () => {
//     if (!selectedOrder) return;
//     try {
//       const payload = { deliverytime: currentTime.toISOString() };
//       const res = await fetch(`http://localhost:5055/delivery-order/${selectedOrder.id}`, {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });
//       if (!res.ok) throw new Error('Failed to update delivery time');
//       message.success('Delivery time recorded!');
//       fetchOrders();
//       setSelectedOrder(null);
//     } catch (err) {
//       message.error(err instanceof Error ? err.message : 'Failed to update delivery time');
//     }
//   };

//   const columns = [
//     { title: 'DO Number', dataIndex: 'noDo', key: 'noDo' },
//     { title: 'Driver', dataIndex: ['driver', 'name'], key: 'driver' },
//     { title: 'Truck', dataIndex: ['truck', 'noPol'], key: 'truck' },
//     {
//       title: 'Date',
//       dataIndex: 'date',
//       key: 'date',
//       render: (val: string) => dayjs(val).format('DD/MM/YYYY'),
//     },
//     {
//       title: 'Delivery Time',
//       dataIndex: 'deliverytime',
//       key: 'deliverytime',
//       render: (val: string | undefined | null) => (val ? dayjs(val).format('HH:mm:ss') : '-'),
//     },
//   ];

//   return (
//     <div className="max-w-6xl mx-auto p-4">
//       <Card
//         title="Delivery Final"
//         extra={
//           <DatePicker
//             value={filterDate}
//             onChange={(date) => setFilterDate(date)}
//             allowClear
//           />
//         }
//       >
//         <Table
//           columns={columns}
//           dataSource={orders}
//           rowKey={(record) => record.id.toString()}
//           loading={loading}
//           pagination={{ pageSize: 10, showSizeChanger: true }}
//           onRow={(record) => ({
//             onClick: () => setSelectedOrder(record),
//           })}
//           rowClassName={(record) => (selectedOrder?.id === record.id ? 'bg-blue-50' : '')}
//         />
//       </Card>

//       <Modal
//         title={selectedOrder?.noDo}
//         open={!!selectedOrder}
//         onCancel={() => setSelectedOrder(null)}
//         footer={[
//           <span key="time">Current Time: {currentTime.format('HH:mm:ss')}</span>,
//           <Button key="send" type="primary" onClick={handleSendDelivery}>
//             Kirim
//           </Button>,
//         ]}
//         width={600}
//       >
//         {selectedOrder && (
//           <>
//             <p>Driver: {selectedOrder.driver?.name ?? '-'}</p>
//             <p>Truck: {selectedOrder.truck?.noPol ?? '-'}</p>
//             <p>Customer: {selectedOrder.customer?.name ?? '-'}</p>
//             <p>
//               Delivery Time:{' '}
//               {selectedOrder.deliverytime ? dayjs(selectedOrder.deliverytime).format('HH:mm:ss') : '-'}
//             </p>

//             <Collapse>
//               <Panel header="View Items" key="1">
//                 <ul>
//                   {selectedOrder.items
//                     .filter((i) => i.customerId === selectedOrder.customer?.id)
//                     .map((item) => (
//                       <li key={item.id}>
//                         {item.name} - Qty: {item.qty}
//                       </li>
//                     ))}
//                 </ul>
//               </Panel>
//             </Collapse>
//           </>
//         )}
//       </Modal>
//     </div>
//   );
// }

// 'use client';

// import React, { useEffect, useState } from 'react';
// import { Table, Card, Button, message, Modal, DatePicker, Collapse } from 'antd';
// import dayjs, { Dayjs } from 'dayjs';

// const { Panel } = Collapse;

// interface DeliveryOrder {
//   id: number;
//   noDo: string;
//   truck: { id: number; noPol: string };
//   driver: { id: number; name: string };
//   customer?: { id: number; name: string };
//   date: string;
//   deliverytime?: string | null;
//   items: { id: number; name: string; qty: number; customerId: number }[];
// }

// export default function DeliveryFinalPage() {
//   const [allOrders, setAllOrders] = useState<DeliveryOrder[]>([]); // semua data
//   const [orders, setOrders] = useState<DeliveryOrder[]>([]); // data yang ditampilkan
//   const [loading, setLoading] = useState(false);
//   const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(null);
//   const [currentTime, setCurrentTime] = useState(dayjs());
//   const [filterDate, setFilterDate] = useState<Dayjs | null>(null);

//   // Live clock
//   useEffect(() => {
//     const interval = setInterval(() => setCurrentTime(dayjs()), 1000);
//     return () => clearInterval(interval);
//   }, []);

//   // Fetch all data sekali saja
//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const fetchOrders = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch('http://localhost:5055/delivery-order');
//       if (!res.ok) throw new Error('Failed to fetch delivery orders');
//       const data: DeliveryOrder[] = await res.json();
//       setAllOrders(data);
//       setOrders(data);
//     } catch (err) {
//       message.error(err instanceof Error ? err.message : 'Failed to load orders');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Filter frontend saat filterDate berubah
//   useEffect(() => {
//     if (!filterDate) {
//       setOrders(allOrders);
//       return;
//     }
//     const filtered = allOrders.filter(order =>
//       dayjs(order.date).isSame(filterDate, 'day')
//     );
//     setOrders(filtered);
//   }, [filterDate, allOrders]);

//   const handleSendDelivery = async () => {
//     if (!selectedOrder) return;
//     try {
//       const payload = { deliverytime: currentTime.toISOString() };
//       const res = await fetch(`http://localhost:5055/delivery-order/${selectedOrder.id}`, {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });
//       if (!res.ok) throw new Error('Failed to update delivery time');
//       message.success('Delivery time recorded!');
//       fetchOrders();
//       setSelectedOrder(null);
//     } catch (err) {
//       message.error(err instanceof Error ? err.message : 'Failed to update delivery time');
//     }
//   };

//   const columns = [
//     { title: 'DO Number', dataIndex: 'noDo', key: 'noDo' },
//     { title: 'Driver', dataIndex: ['driver', 'name'], key: 'driver' },
//     { title: 'Truck', dataIndex: ['truck', 'noPol'], key: 'truck' },
//     {
//       title: 'Date',
//       dataIndex: 'date',
//       key: 'date',
//       render: (val: string) => dayjs(val).format('DD/MM/YYYY'),
//     },
//     {
//       title: 'Delivery Time',
//       dataIndex: 'deliverytime',
//       key: 'deliverytime',
//       render: (val: string | undefined | null) => (val ? dayjs(val).format('HH:mm:ss') : '-'),
//     },
//   ];

//   return (
//     <div className="max-w-6xl mx-auto p-4">
//       <Card
//         title="Delivery Final"
//         extra={
//           <DatePicker
//             value={filterDate}
//             onChange={(date) => setFilterDate(date)}
//             allowClear
//           />
//         }
//       >
//         <Table
//           columns={columns}
//           dataSource={orders}
//           rowKey={(record) => record.id.toString()}
//           loading={loading}
//           pagination={{ pageSize: 10, showSizeChanger: true }}
//           onRow={(record) => ({
//             onClick: () => setSelectedOrder(record),
//           })}
//           rowClassName={(record) => (selectedOrder?.id === record.id ? 'bg-blue-50' : '')}
//         />
//       </Card>

//       <Modal
//         title={selectedOrder?.noDo}
//         open={!!selectedOrder}
//         onCancel={() => setSelectedOrder(null)}
//         footer={[
//           <span key="time">Current Time: {currentTime.format('HH:mm:ss')}</span>,
//           <Button key="send" type="primary" onClick={handleSendDelivery}>
//             Kirim
//           </Button>,
//         ]}
//         width={600}
//       >
//         {selectedOrder && (
//           <>
//             <p>Driver: {selectedOrder.driver?.name ?? '-'}</p>
//             <p>Truck: {selectedOrder.truck?.noPol ?? '-'}</p>
//             <p>Customer: {selectedOrder.customer?.name ?? '-'}</p>
//             <p>
//               Delivery Time:{' '}
//               {selectedOrder.deliverytime ? dayjs(selectedOrder.deliverytime).format('HH:mm:ss') : '-'}
//             </p>

//             <Collapse>
//               <Panel header="View Items" key="1">
//                 <ul>
//                   {selectedOrder.items
//                     .filter((i) => i.customerId === selectedOrder.customer?.id)
//                     .map((item) => (
//                       <li key={item.id}>
//                         {item.name} - Qty: {item.qty}
//                       </li>
//                     ))}
//                 </ul>
//               </Panel>
//             </Collapse>
//           </>
//         )}
//       </Modal>
//     </div>
//   );
// }

// 'use client';

// import React, { useEffect, useState } from 'react';
// import { Table, Card, Button, message, Modal, DatePicker, Collapse, Space } from 'antd';
// import type { ColumnType } from 'antd/es/table';
// import dayjs from 'dayjs';

// const { Panel } = Collapse;

// interface DeliveryOrder {
//   id: number;
//   noDo: string;
//   truck: { id: number; noPol: string };
//   driver: { id: number; name: string };
//   customer?: { id: number; name: string };
//   date: string;
//   deliverytime?: string | null;
//   items: { id: number; name: string; qty: number; customerId: number }[];
// }

// export default function DeliveryFinalPage() {
//   const [orders, setOrders] = useState<DeliveryOrder[]>([]);
//   const [filteredOrders, setFilteredOrders] = useState<DeliveryOrder[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(null);
//   const [currentTime, setCurrentTime] = useState(dayjs());
//   const [filterDate, setFilterDate] = useState<dayjs.Dayjs | null>(null);

//   // Live clock
//   useEffect(() => {
//     const interval = setInterval(() => setCurrentTime(dayjs()), 1000);
//     return () => clearInterval(interval);
//   }, []);

//   // Fetch data
//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const fetchOrders = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch('http://localhost:5055/delivery-order');
//       if (!res.ok) throw new Error('Failed to fetch delivery orders');
//       const data: DeliveryOrder[] = await res.json();
//       setOrders(data);
//       setFilteredOrders(data);
//     } catch (err) {
//       message.error(err instanceof Error ? err.message : 'Failed to load orders');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Filter data based on date
//   useEffect(() => {
//     if (filterDate) {
//       setFilteredOrders(
//         orders.filter(order => dayjs(order.date).isSame(filterDate, 'day'))
//       );
//     } else {
//       setFilteredOrders(orders);
//     }
//   }, [filterDate, orders]);

//   const handleSendDelivery = async () => {
//     if (!selectedOrder) return;
//     try {
//       const payload = { deliverytime: currentTime.toISOString() };
//       const res = await fetch(`http://localhost:5055/delivery-order/${selectedOrder.id}`, {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });
//       if (!res.ok) throw new Error('Failed to update delivery time');
//       message.success('Delivery time recorded!');
//       fetchOrders();
//       setSelectedOrder(null);
//     } catch (err) {
//       message.error(err instanceof Error ? err.message : 'Failed to update delivery time');
//     }
//   };

//   const columns: ColumnType<DeliveryOrder>[] = [
//     { title: 'DO Number', dataIndex: 'noDo', key: 'noDo' },
//     { title: 'Driver', dataIndex: ['driver', 'name'], key: 'driver' },
//     { title: 'Truck', dataIndex: ['truck', 'noPol'], key: 'truck' },
//     {
//       title: 'Date',
//       dataIndex: 'date',
//       key: 'date',
//       render: (val: string) => dayjs(val).format('DD/MM/YYYY'),
//     },
//     {
//       title: 'Delivery Time',
//       dataIndex: 'deliverytime',
//       key: 'deliverytime',
//       render: (val: string | undefined | null) =>
//         val ? dayjs(val).format('HH:mm:ss') : '-',
//     },
//   ];

//   return (
//     <div className="max-w-6xl mx-auto p-4">
//       <Card
//         title="Delivery Final"
//         extra={
//           <Space>
//             <DatePicker
//               value={filterDate}
//               onChange={setFilterDate}
//               allowClear
//               placeholder="Filter by date"
//             />
//             <Button onClick={() => setFilterDate(null)}>Reset</Button>
//           </Space>
//         }
//       >
//         <Table
//           columns={columns}
//           dataSource={filteredOrders}
//           rowKey={(record) => record.id.toString()}
//           loading={loading}
//           pagination={{ pageSize: 10, showSizeChanger: true }}
//           onRow={(record) => ({
//             onClick: () => setSelectedOrder(record),
//           })}
//           rowClassName={(record) =>
//             selectedOrder?.id === record.id ? 'bg-blue-50' : ''
//           }
//         />
//       </Card>

//       <Modal
//         title={selectedOrder?.noDo}
//         open={!!selectedOrder}
//         onCancel={() => setSelectedOrder(null)}
//         footer={[
//           <span key="time">Current Time: {currentTime.format('HH:mm:ss')}</span>,
//           <Button key="send" type="primary" onClick={handleSendDelivery}>
//             Kirim
//           </Button>,
//         ]}
//         width={600}
//       >
//         {selectedOrder && (
//           <>
//             <p>Driver: {selectedOrder.driver?.name ?? '-'}</p>
//             <p>Truck: {selectedOrder.truck?.noPol ?? '-'}</p>
//             <p>Customer: {selectedOrder.customer?.name ?? '-'}</p>
//             <p>
//               Delivery Time:{' '}
//               {selectedOrder.deliverytime
//                 ? dayjs(selectedOrder.deliverytime).format('HH:mm:ss')
//                 : '-'}
//             </p>

//             <Collapse>
//               <Panel header="View Items" key="1">
//                 <ul>
//                   {selectedOrder.items
//                     .filter((i) => i.customerId === selectedOrder.customer?.id)
//                     .map((item) => (
//                       <li key={item.id}>
//                         {item.name} - Qty: {item.qty}
//                       </li>
//                     ))}
//                 </ul>
//               </Panel>
//             </Collapse>
//           </>
//         )}
//       </Modal>
//     </div>
//   );
// }

// baru sadar kalo ini tuh salah

// jadi harusnya tuh ginih

// truck, driver, date, delivery time
// nah nanti pas diclik muncul rincianya
// orang itu ke customer manah ajah dan

// 'use client';

// import React, { useEffect, useState } from 'react';
// import { Table, Card, Button, message, Modal, DatePicker, Collapse, Space, Tag } from 'antd';
// import type { ColumnType } from 'antd/es/table';
// import dayjs from 'dayjs';

// const { Panel } = Collapse;

// interface DeliveryOrder {
//   id: number;
//   noDo: string;
//   truck: { id: number; noPol: string };
//   driver: { id: number; name: string };
//   date: string;
//   deliverytime?: string | null;
//   items: { id: number; name: string; qty: number; customerId: number }[];
// }

// export default function DeliveryFinalPage() {
//   const [orders, setOrders] = useState<DeliveryOrder[]>([]);
//   const [filteredOrders, setFilteredOrders] = useState<DeliveryOrder[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(null);
//   const [currentTime, setCurrentTime] = useState(dayjs());
//   const [filterDate, setFilterDate] = useState<dayjs.Dayjs | null>(null);

//   // Live clock
//   useEffect(() => {
//     const interval = setInterval(() => setCurrentTime(dayjs()), 1000);
//     return () => clearInterval(interval);
//   }, []);

//   // Fetch data
//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const fetchOrders = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch('http://localhost:5055/delivery-order');
//       if (!res.ok) throw new Error('Failed to fetch delivery orders');
//       const data: DeliveryOrder[] = await res.json();
//       setOrders(data);
//       setFilteredOrders(data);
//     } catch (err) {
//       message.error(err instanceof Error ? err.message : 'Failed to load orders');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Filter data based on date
//   useEffect(() => {
//     if (filterDate) {
//       setFilteredOrders(
//         orders.filter(order => dayjs(order.date).isSame(filterDate, 'day'))
//       );
//     } else {
//       setFilteredOrders(orders);
//     }
//   }, [filterDate, orders]);

//   const handleSendDelivery = async () => {
//     if (!selectedOrder) return;
//     try {
//       const payload = { deliverytime: currentTime.toISOString() };
//       const res = await fetch(`http://localhost:5055/delivery-order/${selectedOrder.id}`, {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });
//       if (!res.ok) throw new Error('Failed to update delivery time');
//       message.success('Delivery time recorded!');
//       fetchOrders();
//       setSelectedOrder(null);
//     } catch (err) {
//       message.error(err instanceof Error ? err.message : 'Failed to update delivery time');
//     }
//   };

//   // Table columns
//   const columns: ColumnType<DeliveryOrder>[] = [
//     { title: 'Truck', dataIndex: ['truck', 'noPol'], key: 'truck' },
//     { title: 'Driver', dataIndex: ['driver', 'name'], key: 'driver' },
//     {
//       title: 'Date',
//       dataIndex: 'date',
//       key: 'date',
//       render: (val: string) => dayjs(val).format('DD/MM/YYYY'),
//     },
//     {
//       title: 'Delivery Time',
//       dataIndex: 'deliverytime',
//       key: 'deliverytime',
//       render: (val: string | undefined | null) =>
//         val ? <Tag color="green">{dayjs(val).format('HH:mm:ss')}</Tag> : <Tag color="red">Belum Kirim</Tag>,
//     },
//   ];

//   return (
//     <div className="max-w-6xl mx-auto p-4">
//       <Card
//         title="Delivery Final"
//         extra={
//           <Space>
//             <DatePicker
//               value={filterDate}
//               onChange={setFilterDate}
//               allowClear
//               placeholder="Filter by date"
//             />
//             <Button onClick={() => setFilterDate(null)}>Reset</Button>
//           </Space>
//         }
//       >
//         <Table
//           columns={columns}
//           dataSource={filteredOrders}
//           rowKey={(record) => record.id.toString()}
//           loading={loading}
//           pagination={{ pageSize: 10, showSizeChanger: true }}
//           onRow={(record) => ({
//             onClick: () => setSelectedOrder(record),
//           })}
//           rowClassName={(record) =>
//             selectedOrder?.id === record.id ? 'bg-blue-50' : ''
//           }
//         />
//       </Card>

//       <Modal
//         title={`Delivery Order ${selectedOrder?.noDo}`}
//         open={!!selectedOrder}
//         onCancel={() => setSelectedOrder(null)}
//         footer={[
//           <span key="time">Current Time: {currentTime.format('HH:mm:ss')}</span>,
//           <Button key="send" type="primary" onClick={handleSendDelivery}>
//             Kirim
//           </Button>,
//         ]}
//         width={700}
//       >
//         {selectedOrder && (
//           <>
//             <p><b>Driver:</b> {selectedOrder.driver?.name ?? '-'}</p>
//             <p><b>Truck:</b> {selectedOrder.truck?.noPol ?? '-'}</p>
//             <p><b>Date:</b> {dayjs(selectedOrder.date).format('DD/MM/YYYY')}</p>
//             <p>
//               <b>Delivery Time:</b>{' '}
//               {selectedOrder.deliverytime
//                 ? dayjs(selectedOrder.deliverytime).format('HH:mm:ss')
//                 : '-'}
//             </p>

//             <Collapse>
//               {Object.values(
//                 selectedOrder.items.reduce((acc, item) => {
//                   const customerId = item.customerId ?? 0;
//                   if (!acc[customerId]) {
//                     acc[customerId] = {
//                       customerId,
//                       items: [],
//                     };
//                   }
//                   acc[customerId].items.push(item);
//                   return acc;
//                 }, {} as Record<number, { customerId: number; items: typeof selectedOrder.items }>)
//               ).map((group) => (
//                 <Panel header={`Customer ID: ${group.customerId}`} key={group.customerId}>
//                   <ul>
//                     {group.items.map((item) => (
//                       <li key={item.id}>
//                         {item.name} - Qty: {item.qty}
//                       </li>
//                     ))}
//                   </ul>
//                 </Panel>
//               ))}
//             </Collapse>
//           </>
//         )}
//       </Modal>
//     </div>
//   );
// }

// 'use client';

// import React, { useEffect, useState } from 'react';
// import { Table, Card, Button, message, Modal, DatePicker, Collapse, Space, Tag } from 'antd';
// import type { ColumnType } from 'antd/es/table';
// import dayjs from 'dayjs';

// const { Panel } = Collapse;

// /** ===== Types sesuai backend ===== */
// type BackendPart2R = {
//   id: number;
//   emiPartName?: string | null;
//   codeNo?: string | null;
// };
// type BackendPart4R = {
//   id: number;
//   emiPartName?: string | null;
//   codeNo?: string | null;
// };

// type BackendItem = {
//   id: number;
//   deliveryOrderId: number;
//   part2rId: number | null;
//   part4rId: number | null;
//   qtyDelivered: number;
//   part2r: BackendPart2R | null;
//   part4r: BackendPart4R | null;
// };

// type BackendOrder = {
//   id: number;
//   noDo: string;
//   driverId: number;
//   scheduleId: number | null;
//   date: string; // ISO
//   customerId: number;
//   createdAt: string;
//   deliverytime: string | null;
//   driver: { id: number; name: string };
//   customer: { id: number; name: string; address?: string | null; createdAt?: string };
//   /** beberapa backend mungkin tidak kirim truck; jadikan optional */
//   truck?: { id: number; noPol: string } | null;
//   items: BackendItem[];
// };

// /** ===== Types untuk UI setelah dinormalisasi ===== */
// interface UIOrder {
//   id: number;
//   noDo: string;
//   date: string;
//   deliverytime?: string | null;
//   driver: { id: number; name: string };
//   customer: { id: number; name: string };
//   truck?: { id: number; noPol: string } | null;
//   items: { id: number; name: string; qty: number }[];
// }

// export default function DeliveryFinalPage() {
//   const [orders, setOrders] = useState<UIOrder[]>([]);
//   const [filteredOrders, setFilteredOrders] = useState<UIOrder[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [selectedOrder, setSelectedOrder] = useState<UIOrder | null>(null);
//   const [currentTime, setCurrentTime] = useState(dayjs());
//   const [filterDate, setFilterDate] = useState<dayjs.Dayjs | null>(null);

//   // Live clock
//   useEffect(() => {
//     const interval = setInterval(() => setCurrentTime(dayjs()), 1000);
//     return () => clearInterval(interval);
//   }, []);

//   // Fetch data
//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const normalizeItemName = (it: BackendItem) => {
//     const name =
//       it.part2r?.emiPartName ||
//       it.part4r?.emiPartName ||
//       it.part2r?.codeNo ||
//       it.part4r?.codeNo ||
//       'Unknown Item';
//     return name;
//   };

//   const fetchOrders = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch('http://localhost:5055/delivery-order');
//       if (!res.ok) throw new Error('Failed to fetch delivery orders');

//       const raw: BackendOrder[] = await res.json();

//       // Normalize -> UIOrder
//       const mapped: UIOrder[] = raw.map((o) => ({
//         id: o.id,
//         noDo: o.noDo,
//         date: o.date,
//         deliverytime: o.deliverytime,
//         driver: { id: o.driver?.id ?? 0, name: o.driver?.name ?? '-' },
//         customer: { id: o.customer?.id ?? 0, name: o.customer?.name ?? '-' },
//         truck: o.truck ?? null, // bisa null kalau backend tidak kirim
//         items: (o.items || []).map((it) => ({
//           id: it.id,
//           name: normalizeItemName(it),
//           qty: it.qtyDelivered,
//         })),
//       }));

//       setOrders(mapped);
//       setFilteredOrders(mapped);
//     } catch (err) {
//       message.error(err instanceof Error ? err.message : 'Failed to load orders');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Filter data based on date
//   useEffect(() => {
//     if (filterDate) {
//       setFilteredOrders(
//         orders.filter((order) => dayjs(order.date).isSame(filterDate, 'day'))
//       );
//     } else {
//       setFilteredOrders(orders);
//     }
//   }, [filterDate, orders]);

//   const handleSendDelivery = async () => {
//     if (!selectedOrder) return;
//     try {
//       const payload = { deliverytime: currentTime.toISOString() };
//       const res = await fetch(`http://localhost:5055/delivery-order/${selectedOrder.id}`, {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });
//       if (!res.ok) throw new Error('Failed to update delivery time');
//       message.success('Delivery time recorded!');
//       await fetchOrders();
//       setSelectedOrder(null);
//     } catch (err) {
//       message.error(err instanceof Error ? err.message : 'Failed to update delivery time');
//     }
//   };

//   // Table columns (ringkas)
//   const columns: ColumnType<UIOrder>[] = [
//     {
//       title: 'Truck',
//       key: 'truck',
//       render: (_, record) => record.truck?.noPol ?? '-',
//     },
//     { title: 'Driver', dataIndex: ['driver', 'name'], key: 'driver' },
//     {
//       title: 'Date',
//       dataIndex: 'date',
//       key: 'date',
//       render: (val: string) => dayjs(val).format('DD/MM/YYYY'),
//     },
//     {
//       title: 'Delivery Time',
//       dataIndex: 'deliverytime',
//       key: 'deliverytime',
//       render: (val: string | undefined | null) =>
//         val ? <Tag color="green">{dayjs(val).format('HH:mm:ss')}</Tag> : <Tag color="red">Belum Kirim</Tag>,
//     },
//   ];

//   return (
//     <div className="max-w-6xl mx-auto p-4">
//       <Card
//         title="Delivery Final"
//         extra={
//           <Space>
//             <DatePicker
//               value={filterDate}
//               onChange={setFilterDate}
//               allowClear
//               placeholder="Filter by date"
//             />
//             <Button onClick={() => setFilterDate(null)}>Reset</Button>
//           </Space>
//         }
//       >
//         <Table<UIOrder>
//           columns={columns}
//           dataSource={filteredOrders}
//           rowKey={(record) => record.id.toString()}
//           loading={loading}
//           pagination={{ pageSize: 10, showSizeChanger: true }}
//           onRow={(record) => ({
//             onClick: () => setSelectedOrder(record),
//           })}
//           rowClassName={(record) => (selectedOrder?.id === record.id ? 'bg-blue-50' : '')}
//         />
//       </Card>

//       <Modal
//         title={`Detail Delivery - Driver: ${selectedOrder?.driver?.name ?? '-'}`}
//         open={!!selectedOrder}
//         onCancel={() => setSelectedOrder(null)}
//         footer={[
//           <span key="time">Current Time: {currentTime.format('HH:mm:ss')}</span>,
//           <Button key="send" type="primary" onClick={handleSendDelivery}>
//             Kirim
//           </Button>,
//         ]}
//         width={800}
//       >
//         {selectedOrder && (
//           <>
//             <p><b>Truck:</b> {selectedOrder.truck?.noPol ?? '-'}</p>
//             <p><b>Date:</b> {dayjs(selectedOrder.date).format('DD/MM/YYYY')}</p>
//             <p>
//               <b>Delivery Time:</b>{' '}
//               {selectedOrder.deliverytime ? dayjs(selectedOrder.deliverytime).format('HH:mm:ss') : '-'}
//             </p>

//             {/* DO -> Customer -> Items */}
//             <Collapse accordion>
//               <Panel header={`DO Number: ${selectedOrder.noDo}`} key="do">
//                 <p><b>Customer:</b> {selectedOrder.customer?.name ?? '-'}</p>
//                 <ul>
//                   {selectedOrder.items.map((item) => (
//                     <li key={item.id}>
//                       {item.name} — Qty: {item.qty}
//                     </li>
//                   ))}
//                 </ul>
//               </Panel>
//             </Collapse>
//           </>
//         )}
//       </Modal>
//     </div>
//   );
// }

// 'use client';

// import React, { useEffect, useState } from 'react';
// import { Table, Card, Button, message, Modal, DatePicker, Collapse, Space, Tag } from 'antd';
// import type { ColumnType } from 'antd/es/table';
// import dayjs from 'dayjs';

// const { Panel } = Collapse;

// /** ===== Types sesuai backend ===== */
// type BackendPart2R = {
//   id: number;
//   emiPartName?: string | null;
//   codeNo?: string | null;
// };
// type BackendPart4R = {
//   id: number;
//   emiPartName?: string | null;
//   codeNo?: string | null;
// };

// type BackendItem = {
//   id: number;
//   deliveryOrderId: number;
//   part2rId: number | null;
//   part4rId: number | null;
//   qtyDelivered: number;
//   part2r: BackendPart2R | null;
//   part4r: BackendPart4R | null;
// };

// type BackendOrder = {
//   id: number;
//   noDo: string;
//   driverId: number;
//   scheduleId: number | null;
//   date: string; // ISO
//   customerId: number;
//   createdAt: string;
//   deliverytime: string | null;
//   driver: { id: number; name: string };
//   customer: { id: number; name: string; address?: string | null; createdAt?: string };
//   /** beberapa backend mungkin tidak kirim truck; jadikan optional */
//   truck?: { id: number; noPol: string } | null;
//   items: BackendItem[];
// };

// type BackendSchedule = {
//   id: number;
//   cycle: number;
//   scheduleAt: string;
//   truckId: number;
//   driverId: number;
// };

// /** ===== Types untuk UI setelah dinormalisasi ===== */
// interface UIOrder {
//   id: number;
//   noDo: string;
//   date: string;
//   deliverytime?: string | null;
//   driver: { id: number; name: string };
//   customer: { id: number; name: string };
//   truck?: { id: number; noPol: string } | null;
//   items: { id: number; name: string; qty: number }[];
//   cycle?: number | null; // ✅ Tambahkan cycle
// }

// export default function DeliveryFinalPage() {
//   const [orders, setOrders] = useState<UIOrder[]>([]);
//   const [filteredOrders, setFilteredOrders] = useState<UIOrder[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [selectedOrder, setSelectedOrder] = useState<UIOrder | null>(null);
//   const [currentTime, setCurrentTime] = useState(dayjs());
//   const [filterDate, setFilterDate] = useState<dayjs.Dayjs | null>(null);

//   // Live clock
//   useEffect(() => {
//     const interval = setInterval(() => setCurrentTime(dayjs()), 1000);
//     return () => clearInterval(interval);
//   }, []);

//   // Fetch data
//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const normalizeItemName = (it: BackendItem) => {
//     const name =
//       it.part2r?.emiPartName ||
//       it.part4r?.emiPartName ||
//       it.part2r?.codeNo ||
//       it.part4r?.codeNo ||
//       'Unknown Item';
//     return name;
//   };

//   const fetchOrders = async () => {
//     setLoading(true);
//     try {
//       const [orderRes, scheduleRes] = await Promise.all([
//         fetch('http://localhost:5055/delivery-order'),
//         fetch('http://localhost:5055/schedule-truck'),
//       ]);
//       if (!orderRes.ok || !scheduleRes.ok) throw new Error('Failed to fetch data');

//       const rawOrders: BackendOrder[] = await orderRes.json();
//       const schedules: BackendSchedule[] = await scheduleRes.json();

//       // Normalize -> UIOrder
//       const mapped: UIOrder[] = rawOrders.map((o) => {
//         const schedule = o.scheduleId ? schedules.find((s) => s.id === o.scheduleId) : null;

//         return {
//           id: o.id,
//           noDo: o.noDo,
//           date: o.date,
//           deliverytime: o.deliverytime,
//           driver: { id: o.driver?.id ?? 0, name: o.driver?.name ?? '-' },
//           customer: { id: o.customer?.id ?? 0, name: o.customer?.name ?? '-' },
//           truck: o.truck ?? null,
//           items: (o.items || []).map((it) => ({
//             id: it.id,
//             name: normalizeItemName(it),
//             qty: it.qtyDelivered,
//           })),
//           cycle: schedule?.cycle ?? null, // ✅ Inject cycle dari schedule-truck
//         };
//       });

//       setOrders(mapped);
//       setFilteredOrders(mapped);
//     } catch (err) {
//       message.error(err instanceof Error ? err.message : 'Failed to load orders');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Filter data based on date
//   useEffect(() => {
//     if (filterDate) {
//       setFilteredOrders(orders.filter((order) => dayjs(order.date).isSame(filterDate, 'day')));
//     } else {
//       setFilteredOrders(orders);
//     }
//   }, [filterDate, orders]);

//   const handleSendDelivery = async () => {
//     if (!selectedOrder) return;
//     try {
//       const payload = { deliverytime: currentTime.toISOString() };
//       const res = await fetch(`http://localhost:5055/delivery-order/${selectedOrder.id}`, {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });
//       if (!res.ok) throw new Error('Failed to update delivery time');
//       message.success('Delivery time recorded!');
//       await fetchOrders();
//       setSelectedOrder(null);
//     } catch (err) {
//       message.error(err instanceof Error ? err.message : 'Failed to update delivery time');
//     }
//   };

//   // Table columns
//   const columns: ColumnType<UIOrder>[] = [
//     {
//       title: 'Truck',
//       key: 'truck',
//       render: (_, record) => record.truck?.noPol ?? '-',
//     },
//     { title: 'Driver', dataIndex: ['driver', 'name'], key: 'driver' },
//     {
//       title: 'Cycle',
//       key: 'cycle',
//       render: (_, record) => record.cycle ?? '-',
//     },
//     {
//       title: 'Date',
//       dataIndex: 'date',
//       key: 'date',
//       render: (val: string) => dayjs(val).format('DD/MM/YYYY'),
//     },
//     {
//       title: 'Delivery Time',
//       dataIndex: 'deliverytime',
//       key: 'deliverytime',
//       render: (val: string | undefined | null) =>
//         val ? <Tag color="green">{dayjs(val).format('HH:mm:ss')}</Tag> : <Tag color="red">Belum Kirim</Tag>,
//     },
//   ];

//   return (
//     <div className="max-w-6xl mx-auto p-4">
//       <Card
//         title="Delivery Final"
//         extra={
//           <Space>
//             <DatePicker
//               value={filterDate}
//               onChange={setFilterDate}
//               allowClear
//               placeholder="Filter by date"
//             />
//             <Button onClick={() => setFilterDate(null)}>Reset</Button>
//           </Space>
//         }
//       >
//         <Table<UIOrder>
//           columns={columns}
//           dataSource={filteredOrders}
//           rowKey={(record) => record.id.toString()}
//           loading={loading}
//           pagination={{ pageSize: 10, showSizeChanger: true }}
//           onRow={(record) => ({
//             onClick: () => setSelectedOrder(record),
//           })}
//           rowClassName={(record) => (selectedOrder?.id === record.id ? 'bg-blue-50' : '')}
//         />
//       </Card>

//       <Modal
//         title={`Detail Delivery - Driver: ${selectedOrder?.driver?.name ?? '-'}`}
//         open={!!selectedOrder}
//         onCancel={() => setSelectedOrder(null)}
//         footer={[
//           <span key="time">Current Time: {currentTime.format('HH:mm:ss')}</span>,
//           <Button key="send" type="primary" onClick={handleSendDelivery}>
//             Kirim
//           </Button>,
//         ]}
//         width={800}
//       >
//         {selectedOrder && (
//           <>
//             <p><b>Truck:</b> {selectedOrder.truck?.noPol ?? '-'}</p>
//             <p><b>Cycle:</b> {selectedOrder.cycle ?? '-'}</p>
//             <p><b>Date:</b> {dayjs(selectedOrder.date).format('DD/MM/YYYY')}</p>
//             <p>
//               <b>Delivery Time:</b>{' '}
//               {selectedOrder.deliverytime ? dayjs(selectedOrder.deliverytime).format('HH:mm:ss') : '-'}
//             </p>

//             {/* DO -> Customer -> Items */}
//             <Collapse accordion>
//               <Panel header={`DO Number: ${selectedOrder.noDo}`} key="do">
//                 <p><b>Customer:</b> {selectedOrder.customer?.name ?? '-'}</p>
//                 <ul>
//                   {selectedOrder.items.map((item) => (
//                     <li key={item.id}>
//                       {item.name} — Qty: {item.qty}
//                     </li>
//                   ))}
//                 </ul>
//               </Panel>
//             </Collapse>
//           </>
//         )}
//       </Modal>
//     </div>
//   );
// }
// =====================================================================
"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Button,
  message,
  Modal,
  DatePicker,
  Collapse,
  Space,
  Tag,
  Divider,
} from "antd";
import type { ColumnType } from "antd/es/table";
import dayjs from "dayjs";

const { Panel } = Collapse;

/** ===== Types sesuai backend (tolerant) ===== */
type BackendPart2R = {
  id: number;
  emiPartName?: string | null;
};
type BackendPart4R = {
  id: number;
  model?: string | null;
};

type BackendItem = {
  id: number;
  deliveryOrderId: number;
  part2rId: number | null;
  part4rId: number | null;
  qtyDelivered: number;
  part2r: BackendPart2R | null;
  part4r: BackendPart4R | null;
};

type BackendOrder = {
  id: number;
  noDo: string;
  driverId: number;
  scheduleId: number | null;
  date: string; // ISO
  customerId: number;
  createdAt: string;
  deliverytime: string | null;
  driver?: { id: number; name: string };
  customer?: {
    id: number;
    name: string;
    address?: string | null;
    createdAt?: string;
  };
  /** delivery-order endpoint may include truck info */
  truck?: { id: number; noPol: string } | null;
  items: BackendItem[];
};

type BackendSchedule = {
  id: number;
  cycle?: number | null;
  scheduleAt?: string;
  truckId?: number;
  truck?: { id: number; noPol: string } | null; // some endpoints include truck object
  driverId?: number;
  driver?: { id: number; name: string } | null;
};

/** ===== UI types ===== */
interface UIOrder {
  id: number;
  noDo: string;
  date: string;
  deliverytime?: string | null;
  driver: { id: number; name: string };
  customer: { id: number; name: string };
  truck?: { id: number; noPol: string } | null;
  items: { id: number; name: string; qty: number }[];
  scheduleId?: number | null;
}

interface GroupedRow {
  key: string; // 'schedule_12' or 'order_34'
  scheduleId?: number | null;
  driver: { id: number; name: string };
  truck?: { id: number; noPol: string } | null;
  cycle?: number | null;
  date: string; // use schedule.scheduleAt if available, else first order date
  orders: UIOrder[]; // underlying orders
}

export default function DeliveryFinalPage() {
  const [groups, setGroups] = useState<GroupedRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupedRow | null>(null);
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [filterDate, setFilterDate] = useState<dayjs.Dayjs | null>(null);

  // Live clock
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(dayjs()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchAndGroup();
  }, []);

  // refetch when filterDate changed? we'll filter later from grouped list
  const fetchAndGroup = async () => {
    setLoading(true);
    try {
      const [orderRes, scheduleRes] = await Promise.all([
        fetch("http://localhost:5055/delivery-order"),
        fetch("http://localhost:5055/schedule-truck"),
      ]);
      if (!orderRes.ok) throw new Error("Failed to fetch delivery orders");
      if (!scheduleRes.ok) throw new Error("Failed to fetch schedules");

      const rawOrders: BackendOrder[] = await orderRes.json();
      const schedules: BackendSchedule[] = await scheduleRes.json();

      // build schedule map
      const scheduleMap = new Map<number, BackendSchedule>();
      (schedules || []).forEach((s) => scheduleMap.set(s.id, s));

      // normalize orders
      const uiOrders: UIOrder[] = (rawOrders || []).map((o) => {
        const schedule = o.scheduleId
          ? (scheduleMap.get(o.scheduleId) ?? null)
          : null;

        // choose truck: prefer schedule.truck, else o.truck, else null
        const truck = schedule?.truck ?? o.truck ?? null;

        const items = (o.items || []).map((it) => {
          const name =
            it.part2r?.emiPartName || it.part4r?.model || "Unknown Item";
          return { id: it.id, name, qty: it.qtyDelivered };
        });

        return {
          id: o.id,
          noDo: o.noDo,
          date: o.date,
          deliverytime: o.deliverytime,
          driver: {
            id: o.driver?.id ?? schedule?.driver?.id ?? 0,
            name: o.driver?.name ?? schedule?.driver?.name ?? "-",
          },
          customer: { id: o.customer?.id ?? 0, name: o.customer?.name ?? "-" },
          truck,
          items,
          scheduleId: o.scheduleId ?? null,
        };
      });

      // Group orders by scheduleId; orders without schedule remain single groups
      const map = new Map<string, GroupedRow>();

      for (const ord of uiOrders) {
        if (ord.scheduleId) {
          const key = `schedule_${ord.scheduleId}`;
          const schedule = scheduleMap.get(ord.scheduleId) ?? null;
          if (!map.has(key)) {
            map.set(key, {
              key,
              scheduleId: ord.scheduleId,
              driver: ord.driver, // fallback; we'll prefer schedule.driver if present
              truck: schedule?.truck ?? ord.truck ?? null,
              cycle: schedule?.cycle ?? null,
              date: schedule?.scheduleAt ?? ord.date,
              orders: [ord],
            });
          } else {
            map.get(key)!.orders.push(ord);
          }
        } else {
          // individual order group
          const key = `order_${ord.id}`;
          map.set(key, {
            key,
            scheduleId: null,
            driver: ord.driver,
            truck: ord.truck ?? null,
            cycle: null,
            date: ord.date,
            orders: [ord],
          });
        }
      }

      // convert to array and sort by date desc
      const groupedArr: GroupedRow[] = Array.from(map.values()).sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      setGroups(groupedArr);
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // filter groups by date if filterDate set
  const displayed = filterDate
    ? groups.filter((g) => dayjs(g.date).isSame(filterDate, "day"))
    : groups;

  const columns: ColumnType<GroupedRow>[] = [
    {
      title: "Truck",
      key: "truck",
      render: (_, record) => record.truck?.noPol ?? "-",
    },
    {
      title: "Driver",
      dataIndex: ["driver", "name"],
      key: "driver",
    },
    {
      title: "Cycle",
      key: "cycle",
      render: (_, record) => (record.cycle ?? "-") as any,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (val: string) => dayjs(val).format("DD/MM/YYYY"),
    },
    {
      title: "Delivery Time",
      key: "deliverytime",
      render: (_, record) => {
        // if any order has deliverytime, show first one (or show aggregated)
        const found = record.orders.find((o) => o.deliverytime);
        return found ? (
          <Tag color="green">
            {dayjs(found.deliverytime).format("HH:mm:ss")}
          </Tag>
        ) : (
          <Tag color="red">Belum Kirim</Tag>
        );
      },
    },
    {
      title: "DO Count",
      key: "count",
      render: (_, record) => record.orders.length,
    },
  ];

  // const handleSendDelivery = async () => {
  //   if (!selectedGroup) return;
  //   try {
  //     // Mark deliverytime for all underlying orders in the group (patch each)
  //     const promises = selectedGroup.orders.map((o) =>
  //       fetch(`http://localhost:5055/delivery-order/${o.id}`, {
  //         method: 'PATCH',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify({ deliverytime: currentTime.toISOString() }),
  //       }),
  //     );
  //     const results = await Promise.all(promises);
  //     const failed = results.find((r) => !r.ok);
  //     if (failed) throw new Error('Failed to update one or more delivery orders');
  //     message.success('Delivery time recorded for group!');
  //     await fetchAndGroup();
  //     setSelectedGroup(null);
  //   } catch (err) {
  //     message.error(err instanceof Error ? err.message : 'Failed to update delivery time');
  //   }
  // };

  // Build aggregated items list for modal

  const handleSendDelivery = async () => {
    if (!selectedGroup) return;

    try {
      // 1️⃣ Update deliverytime semua DO di group
      const updatePromises = selectedGroup.orders.map((order) =>
        fetch(`http://localhost:5055/delivery-order/${order.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deliverytime: currentTime.toISOString() }),
        }),
      );

      const updateResults = await Promise.all(updatePromises);
      const failedUpdate = updateResults.find((res) => !res.ok);
      if (failedUpdate)
        throw new Error("Failed to update one or more delivery orders");

      message.success("Delivery time recorded for all orders!");

      // 2️⃣ Kirim WA untuk group
      const orderIds = selectedGroup.orders.map((o) => o.id);
      const waRes = await fetch(
        "http://localhost:5055/delivery-order/send-wa-group",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderIds }),
        },
      );

      if (!waRes.ok) throw new Error("Failed to send WhatsApp message");
      const waData = await waRes.json();

      message.success("WhatsApp message sent successfully!");

      // 3️⃣ Refresh data dan reset selectedGroup
      await fetchAndGroup();
      setSelectedGroup(null);
    } catch (err) {
      message.error(
        err instanceof Error ? err.message : "Something went wrong",
      );
    }
  };

  const buildAggregatedItems = (group: GroupedRow) => {
    const map = new Map<string, number>();
    for (const ord of group.orders) {
      for (const it of ord.items) {
        map.set(it.name, (map.get(it.name) || 0) + it.qty);
      }
    }
    return Array.from(map.entries()).map(([name, qty]) => ({ name, qty }));
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <Card
        title="Delivery Final"
        extra={
          <Space>
            <DatePicker
              value={filterDate}
              onChange={setFilterDate}
              allowClear
              placeholder="Filter by date"
            />
            <Button onClick={() => setFilterDate(null)}>Reset</Button>
          </Space>
        }
      >
        <Table<GroupedRow>
          columns={columns}
          dataSource={displayed}
          rowKey={(record) => record.key}
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          onRow={(record) => ({
            onClick: () => setSelectedGroup(record),
          })}
          rowClassName={(record) =>
            selectedGroup?.key === record.key ? "bg-blue-50" : ""
          }
        />
      </Card>

      <Modal
        title={`Detail Delivery - Driver: ${selectedGroup?.driver?.name ?? "-"}`}
        open={!!selectedGroup}
        onCancel={() => setSelectedGroup(null)}
        //        footer={[
        //   <div
        //     key="footer-content"
        //     style={{
        //       display: 'flex',
        //       justifyContent: 'space-between', // Pisahkan teks dan tombol ke kiri-kanan
        //       alignItems: 'center',
        //       width: '100%',
        //     }}
        //   >
        //     <span>Time: {currentTime.format('HH:mm:ss')}</span>
        //     <Button type="primary" onClick={handleSendDelivery}>
        //       Kirim
        //     </Button>
        //   </div>
        // ]}

        footer={[
          <span key="time">Time: {currentTime.format("HH:mm:ss")}</span>,
          <Button
            key="send"
            type="primary"
            style={{ marginLeft: "20px" }}
            onClick={handleSendDelivery}
          >
            Kirim
          </Button>,
        ]}

        width={900}
      >
        {selectedGroup && (
          <>
            <p>
              <b>Truck:</b> {selectedGroup.truck?.noPol ?? "-"}
            </p>
            <p>
              <b>Cycle:</b> {selectedGroup.cycle ?? "-"}
            </p>
            <p>
              <b>Date:</b> {dayjs(selectedGroup.date).format("DD/MM/YYYY")}
            </p>

            <p>
              <b>Delivery Time:</b>{" "}
              {selectedGroup.orders.some((o) => o.deliverytime)
                ? selectedGroup.orders
                  .map((o) => o.deliverytime)
                  .filter(Boolean)[0] &&
                dayjs(
                  selectedGroup.orders
                    .map((o) => o.deliverytime)
                    .filter(Boolean)[0],
                ).format("HH:mm:ss")
                : "-"}
            </p>

            <Divider />

            <h4>DO List ({selectedGroup.orders.length})</h4>
            {/* <Collapse accordion>
              {selectedGroup.orders.map((o) => (
                <Panel header={`DO Number: ${o.noDo} — Customer: ${o.customer?.name ?? '-'}`} key={o.id}>
                  <p><b>DO Date:</b> {dayjs(o.date).format('DD/MM/YYYY')}</p>
                  <p><b>Delivery Time:</b> {o.deliverytime ? dayjs(o.deliverytime).format('HH:mm:ss') : '-'}</p>
                  <ul>
                    {o.items.map((it) => (
                      <li key={it.id}>{it.name} — Qty: {it.qty}</li>
                    ))}
                  </ul>
                </Panel>
              ))}
            </Collapse> */}
            <ul className="ml-2 space-y-2">
              {Array.from(
                selectedGroup.orders.reduce((map, o) => {
                  const name = o.customer?.name ?? "Unknown";
                  if (!map.has(name)) map.set(name, []);
                  map.get(name)!.push(o);
                  return map;
                }, new Map<string, UIOrder[]>()),
              ).map(([customerName, orders]) => {
                const totalQty = orders.reduce(
                  (sum, o) => sum + o.items.reduce((s, it) => s + it.qty, 0),
                  0,
                );
                const deliveryTimes = orders
                  .map((o) =>
                    o.deliverytime
                      ? dayjs(o.deliverytime).format("HH:mm")
                      : "-",
                  )
                  .join(", ");

                return (
                  <li key={customerName} className="border-b pb-2">
                    <div className="font-semibold text-blue-600">
                      ▼ {customerName} &nbsp; Total: {totalQty} &nbsp;
                    </div>
                    <ul className="ml-4 list-disc mt-1">
                      {orders.map((o) => (
                        <li key={o.id} className="mb-1">
                          <span className="text-gray-800 font-mono">
                            &gt; {o.noDo}
                          </span>
                          <ul className="ml-4 list-disc">
                            {o.items.map((it) => (
                              <li key={it.id}>
                                {it.name} ({it.qty})
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ul>

            <Divider />

            {/* <h4>Aggregated Items (all DOs in this group)</h4>
            <ul>
              {buildAggregatedItems(selectedGroup).map((a) => (
                <li key={a.name}>
                  {a.name} — Qty: {a.qty}
                </li>
              ))}
            </ul> */}
          </>
        )}
      </Modal>
    </div>
  );
}
