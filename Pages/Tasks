import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Clock, Play, Square, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function TasksPage() {
  const [activeTask, setActiveTask] = React.useState(null);
  const [elapsedTime, setElapsedTime] = React.useState(0);
  const [showStartDialog, setShowStartDialog] = React.useState(false);
  const [showEndDialog, setShowEndDialog] = React.useState(false);
  const queryClient = useQueryClient();

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list("-created_date"),
    initialData: [],
  });

  const currentTask = tasks.find(t => t.status === 'in_progress') || tasks[0];

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  React.useEffect(() => {
    let interval;
    if (currentTask?.status === 'in_progress' && currentTask?.start_time) {
      interval = setInterval(() => {
        const start = new Date(currentTask.start_time).getTime();
        const now = new Date().getTime();
        setElapsedTime(Math.floor((now - start) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentTask]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleStartTask = () => {
    if (!currentTask) return;
    updateTaskMutation.mutate({
      id: currentTask.id,
      data: {
        status: 'in_progress',
        start_time: new Date().toISOString()
      }
    });
    setShowStartDialog(false);
  };

  const handleEndTask = () => {
    if (!currentTask) return;
    updateTaskMutation.mutate({
      id: currentTask.id,
      data: {
        status: 'completed',
        end_time: new Date().toISOString(),
        duration: elapsedTime
      }
    });
    setElapsedTime(0);
    setShowEndDialog(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-6 pt-12 pb-6">
        <h1 className="text-3xl font-bold mb-2">Задачи</h1>
        <p className="text-gray-600">Управление рабочими задачами</p>
      </div>

      <div className="px-6 py-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black rounded-3xl p-8 text-white shadow-xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-6 h-6 text-gray-400" />
            <span className="text-gray-400">
              {currentTask?.status === 'pending' && 'Готово к началу работы'}
              {currentTask?.status === 'in_progress' && 'Задача в процессе выполнения'}
              {currentTask?.status === 'completed' && 'Задача завершена'}
            </span>
          </div>

          <h2 className="text-2xl font-bold mb-4">
            {currentTask?.title || 'Рабочая смена'}
          </h2>

          {currentTask?.status === 'in_progress' && (
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-300">
                {currentTask?.description || 'Выполнение рабочих обязанностей'}
              </p>
              <div className="bg-white/20 px-4 py-2 rounded-xl">
                <span className="text-xl font-mono">{formatTime(elapsedTime)}</span>
              </div>
            </div>
          )}

          {currentTask?.status === 'pending' && (
            <p className="text-gray-300 mb-6">
              {currentTask?.description || 'Нажмите кнопку для начала рабочей смены'}
            </p>
          )}

          {currentTask?.status === 'completed' && (
            <div className="mb-6 bg-green-500/20 border border-green-500/30 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">Задача выполнена!</span>
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {currentTask?.status === 'pending' && (
              <motion.div
                key="start"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Button
                  onClick={() => setShowStartDialog(true)}
                  className="w-full h-14 bg-white text-black hover:bg-gray-100 rounded-2xl text-base font-semibold"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Начать выполнение задачи
                </Button>
              </motion.div>
            )}

            {currentTask?.status === 'in_progress' && (
              <motion.div
                key="end"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Button
                  onClick={() => setShowEndDialog(true)}
                  className="w-full h-14 bg-white text-black hover:bg-gray-100 rounded-2xl text-base font-semibold"
                >
                  <Square className="w-5 h-5 mr-2" />
                  Закончить выполнение задачи
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h3 className="text-xl font-bold mb-4">Информация о смене</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Статус</p>
              <p className="font-semibold">
                {currentTask?.status === 'pending' && 'Ожидает начала'}
                {currentTask?.status === 'in_progress' && 'Активная'}
                {currentTask?.status === 'completed' && 'Завершена'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Время работы</p>
              <p className="font-semibold">
                {currentTask?.status === 'in_progress' ? formatTime(elapsedTime) : '--:--'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
        <DialogContent className="rounded-3xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Play className="w-5 h-5 text-orange-600" />
              </div>
              Подтверждение действия
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-base py-4">
            Вы уверены, что хотите начать выполнение задачи?
          </DialogDescription>
          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() => setShowStartDialog(false)}
              className="flex-1 h-12 rounded-xl"
            >
              Отмена
            </Button>
            <Button
              onClick={handleStartTask}
              className="flex-1 h-12 bg-black hover:bg-gray-800 rounded-xl"
            >
              Начать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <DialogContent className="rounded-3xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Square className="w-5 h-5 text-orange-600" />
              </div>
              Подтверждение действия
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-base py-4">
            Вы уверены, что хотите закончить выполнение задачи?
          </DialogDescription>
          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() => setShowEndDialog(false)}
              className="flex-1 h-12 rounded-xl"
            >
              Отмена
            </Button>
            <Button
              onClick={handleEndTask}
              className="flex-1 h-12 bg-black hover:bg-gray-800 rounded-xl"
            >
              Завершить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
