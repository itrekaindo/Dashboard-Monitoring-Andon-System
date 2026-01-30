'use client';

import { ProductProcessTimeline, PicAssyByStatus, AverageProductDuration } from '@/lib/queries/log-produksi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { Clock, CheckCircle, PlayCircle, Users } from 'lucide-react';

interface ProductProcessTimelineChartProps {
  data: ProductProcessTimeline[];
  picAssyData?: PicAssyByStatus[];
  avgDurationData?: AverageProductDuration[];
}

export function ProductProcessTimelineChart({ data, picAssyData = [], avgDurationData = [] }: ProductProcessTimelineChartProps) {
  // Transform average duration data for bar chart
  const durationData = avgDurationData.length > 0
    ? avgDurationData
        .map(item => ({
          nama_produk: item.nama_produk || item.id_product,
          id_product: item.id_product,
          duration_sec: item.avg_duration_sec || 0,
          duration_min: ((item.avg_duration_sec || 0) / 60).toFixed(1),
          duration_formatted: (() => {
            const seconds = item.avg_duration_sec || 0;
            const minutes = Math.floor(seconds / 60);
            const secs = seconds % 60;
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            if (hours > 0) {
              return `${hours}j ${mins}m ${secs}d`;
            }
            return `${mins}m ${secs}d`;
          })(),
          total_records: item.total_records,
          min_duration: item.min_duration_sec || 0,
          max_duration: item.max_duration_sec || 0,
        }))
        .sort((a, b) => (b.duration_sec || 0) - (a.duration_sec || 0))
        .slice(0, 20)
    : data
        .filter(item => item.duration_sec !== null && item.id_product)
        .map(item => ({
          nama_produk: item.nama_produk || item.id_product,
          id_product: item.id_product,
          duration_sec: item.duration_sec || 0,
          duration_min: ((item.duration_sec || 0) / 60).toFixed(1),
          duration_formatted: (() => {
            const seconds = item.duration_sec || 0;
            const minutes = Math.floor(seconds / 60);
            const secs = seconds % 60;
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            if (hours > 0) {
              return `${hours}j ${mins}m ${secs}d`;
            }
            return `${mins}m ${secs}d`;
          })(),
        }))
        .sort((a, b) => (b.duration_sec || 0) - (a.duration_sec || 0))
        .slice(0, 20);

  // Timeline data for visualization
  const timelineData = data
    .filter(item => item.start_time && item.end_time)
    .map((item, idx) => {
      const startTime = new Date(item.start_time as string).getTime();
      const endTime = new Date(item.end_time as string).getTime();
      return {
        idx,
        id_product: item.id_product,
        nama_produk: item.nama_produk || item.id_product,
        start: startTime,
        end: endTime,
        duration_min: ((item.duration_sec || 0) / 60).toFixed(1),
      };
    })
    .sort((a, b) => a.start - b.start)
    .slice(0, 30);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}j ${mins}m ${secs}d`;
    }
    return `${mins}m ${secs}d`;
  };

  // Calculate averages
  const avgDuration = durationData.length > 0 
    ? (durationData.reduce((sum, item) => sum + parseFloat(item.duration_min), 0) / durationData.length).toFixed(1)
    : 0;

  const avgPicAssyCount = picAssyData.length > 0
    ? (picAssyData.reduce((sum, item) => sum + (item.count || 0), 0) / picAssyData.length).toFixed(0)
    : 0;

  const totalProductProcessed = data.filter(item => item.start_time && item.end_time).length;
  const avgProductsPerDay = totalProductProcessed > 0 
    ? (totalProductProcessed / 1).toFixed(0)
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Rata-rata Durasi</p>
                <p className="text-2xl font-bold text-blue-400">{avgDuration}</p>
                <p className="text-gray-500 text-xs">menit</p>
              </div>
              <Clock className="w-10 h-10 text-blue-400/40" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Produk Proses</p>
                <p className="text-2xl font-bold text-emerald-400">{totalProductProcessed}</p>
                <p className="text-gray-500 text-xs">dari semua data</p>
              </div>
              <PlayCircle className="w-10 h-10 text-emerald-400/40" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Rata-rata PIC/Status</p>
                <p className="text-2xl font-bold text-amber-400">{avgPicAssyCount}</p>
                <p className="text-gray-500 text-xs">produk per PIC</p>
              </div>
              <Users className="w-10 h-10 text-amber-400/40" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Duration Chart */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-400">
            <Clock className="w-5 h-5" />
            {avgDurationData.length > 0 ? 'Rata-rata Durasi Proses per Produk (Top 20)' : 'Durasi Proses per Produk (Top 20)'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {durationData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={durationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                <XAxis
                  dataKey="nama_produk"
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis
                  label={{ value: 'Menit', angle: -90, position: 'insideLeft' }}
                  tick={{ fill: '#9CA3AF' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                  }}
                  cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                  formatter={(value: any, name: string | undefined, props: any) => {
                    if (name === 'duration_min') {
                      return [props.payload.duration_formatted, avgDurationData.length > 0 ? 'Rata-rata Durasi' : 'Durasi'];
                    }
                    if (name === 'total_records') {
                      return [value, 'Total Records'];
                    }
                    return [value, name];
                  }}
                  content={(props: any) => {
                    if (!props.active || !props.payload?.length) return null;
                    const data = props.payload[0]?.payload;
                    return (
                      <div className="bg-gray-900/95 p-3 rounded border border-gray-700/50">
                        <p className="text-blue-300 font-medium">{data.nama_produk}</p>
                        <p className="text-gray-300 text-sm">Durasi: {data.duration_formatted}</p>
                        {data.total_records && <p className="text-gray-400 text-xs">Records: {data.total_records}</p>}
                      </div>
                    );
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar
                  dataKey="duration_min"
                  fill="#3B82F6"
                  radius={[8, 8, 0, 0]}
                  name={avgDurationData.length > 0 ? 'Rata-rata Durasi (Menit)' : 'Durasi (Menit)'}
                  label={{
                    dataKey: 'duration_formatted',
                    fill: '#9CA3AF',
                    fontSize: 11,
                    position: 'top'
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-96 flex items-center justify-center text-gray-500">
              Tidak ada data durasi proses
            </div>
          )}
        </CardContent>
      </Card>

      {/* Process Timeline Details */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-400">
            <PlayCircle className="w-5 h-5" />
            Waktu Mulai & Selesai Produk (15 Terbaru)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-900 hover:bg-gray-900">
                    <TableHead className="text-blue-400">Produk</TableHead>
                    <TableHead className="text-blue-400">No. Produk</TableHead>
                    <TableHead className="text-blue-400">Trainset</TableHead>
                    <TableHead className="text-blue-400">PIC ASSY</TableHead>
                    <TableHead className="text-blue-400">Tanggal</TableHead>
                    <TableHead className="text-blue-400">Waktu Mulai</TableHead>
                    <TableHead className="text-blue-400">Waktu Selesai</TableHead>
                    <TableHead className="text-blue-400">Durasi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data
                    .filter(item => item.start_time && item.end_time)
                    .sort((a, b) => {
                      const aTime = new Date(a.start_time as string).getTime();
                      const bTime = new Date(b.start_time as string).getTime();
                      return bTime - aTime;
                    })
                    .slice(0, 15)
                    .map((item, idx) => {
                      const startDate = new Date(item.start_time as string);
                      const endDate = new Date(item.end_time as string);
                      const dateStr = startDate.toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      });
                      const startTimeStr = startDate.toLocaleString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      });
                      const endTimeStr = endDate.toLocaleString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      });

                      return (
                        <TableRow key={idx} className="border-gray-700 hover:bg-gray-900/50">
                          <TableCell className="text-gray-300 font-medium">{item.nama_produk}</TableCell>
                          <TableCell className="text-yellow-400 font-mono text-sm">{item.no_produk || '-'}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-purple-500/10 text-purple-300 border-purple-500/30">
                              {item.trainset ?? '-'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-400 text-sm">{dateStr}</TableCell>
                          <TableCell className="text-emerald-400 font-mono text-sm">{startTimeStr}</TableCell>
                          <TableCell className="text-rose-400 font-mono text-sm">{endTimeStr}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-300 border-blue-500/30">
                              {formatDuration(item.duration_sec)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              Tidak ada data proses produk
            </div>
          )}
        </CardContent>
      </Card>

      {/* PIC ASSY Count Chart */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-400">
            <Users className="w-5 h-5" />
            Jumlah PIC ASSY - Status PROSES ASSY SELESAI
          </CardTitle>
        </CardHeader>
        <CardContent>
          {picAssyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={picAssyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                <XAxis
                  dataKey="pic_assy"
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis
                  label={{ value: 'Jumlah', angle: -90, position: 'insideLeft' }}
                  tick={{ fill: '#9CA3AF' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                  }}
                  cursor={{ fill: 'rgba(251, 146, 60, 0.1)' }}
                  formatter={(value: any) => [value, 'Jumlah Selesai']}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar
                  dataKey="count"
                  fill="#F59E0B"
                  radius={[8, 8, 0, 0]}
                  name="Jumlah PROSES ASSY SELESAI"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-96 flex items-center justify-center text-gray-500">
              Tidak ada data PIC ASSY
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
