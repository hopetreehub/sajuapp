import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarEvent, eventService } from '../services/api';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  event?: CalendarEvent | null;
  initialDate?: Date;
}

const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  event,
  initialDate
}) => {
  const [formData, setFormData] = useState<Partial<CalendarEvent>>({
    title: '',
    description: '',
    start_time: initialDate ? format(initialDate, "yyyy-MM-dd'T'HH:mm") : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    end_time: initialDate ? format(new Date(initialDate.getTime() + 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm") : format(new Date(Date.now() + 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"),
    all_day: false,
    location: '',
    type: 'personal',
    color: '#3b82f6',
    reminder_minutes: 15
  });

  useEffect(() => {
    if (event) {
      setFormData(event);
    } else if (initialDate) {
      setFormData(prev => ({
        ...prev,
        start_time: format(initialDate, "yyyy-MM-dd'T'HH:mm"),
        end_time: format(new Date(initialDate.getTime() + 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"),
      }));
    }
  }, [event, initialDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.start_time || !formData.end_time) {
      alert('제목과 시간을 입력해주세요.');
      return;
    }

    try {
      // 백엔드가 필드명 변환을 처리하므로 원래 프론트엔드 필드명으로 전송
      const apiData = {
        title: formData.title,
        description: formData.description,
        start_time: formData.start_time,
        end_time: formData.end_time,
        all_day: formData.all_day,
        location: formData.location,
        type: formData.type,
        color: formData.color,
        reminder_minutes: formData.reminder_minutes || 0
      };
      
      console.log('Sending API data:', apiData);
      console.log('API URL:', import.meta.env.VITE_API_URL || 'http://localhost:5556');
      
      let savedEvent: CalendarEvent;
      
      if (event?.id) {
        console.log('Updating event with ID:', event.id);
        savedEvent = await eventService.updateEvent(event.id, apiData);
      } else {
        console.log('Creating new event...');
        savedEvent = await eventService.createEvent(apiData as any);
      }
      
      console.log('Event saved successfully:', savedEvent);
      onSave(savedEvent);
      onClose();
    } catch (error) {
      console.error('Failed to save event - Full error:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      } else if (error.request) {
        console.error('Request was made but no response:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      alert(`일정 저장에 실패했습니다: ${error.message}`);
    }
  };

  const handleDelete = async () => {
    if (event?.id && window.confirm('이 일정을 삭제하시겠습니까?')) {
      try {
        await eventService.deleteEvent(event.id);
        onClose();
        window.location.reload(); // Temporary solution to refresh events
      } catch (error) {
        console.error('Failed to delete event:', error);
        alert('일정 삭제에 실패했습니다.');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-border">
        <h2 className="text-xl font-bold mb-4 text-foreground">
          {event ? '일정 수정' : '새 일정'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">제목*</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary-500 bg-background text-foreground"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">설명</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary-500 bg-background text-foreground"
              rows={3}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.all_day}
              onChange={(e) => setFormData({ ...formData, all_day: e.target.checked })}
              className="mr-2"
            />
            <label className="text-sm text-foreground">종일</label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">시작*</label>
              <input
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary-500 bg-background text-foreground"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">종료*</label>
              <input
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary-500 bg-background text-foreground"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">위치</label>
            <input
              type="text"
              value={formData.location || ''}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary-500 bg-background text-foreground"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">유형</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary-500 bg-background text-foreground"
            >
              <option value="personal">개인</option>
              <option value="work">업무</option>
              <option value="holiday">휴일</option>
              <option value="other">기타</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">색상</label>
            <input
              type="color"
              value={formData.color || '#3b82f6'}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="w-full h-10 border border-border rounded-md bg-background"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">알림 (분)</label>
            <select
              value={formData.reminder_minutes}
              onChange={(e) => setFormData({ ...formData, reminder_minutes: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary-500 bg-background text-foreground"
            >
              <option value="0">없음</option>
              <option value="5">5분 전</option>
              <option value="10">10분 전</option>
              <option value="15">15분 전</option>
              <option value="30">30분 전</option>
              <option value="60">1시간 전</option>
              <option value="1440">1일 전</option>
            </select>
          </div>

          <div className="flex justify-between pt-4">
            <div>
              {event?.id && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 text-red-600 hover:bg-red-500/10 rounded-md"
                >
                  삭제
                </button>
              )}
            </div>
            <div className="space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-foreground hover:bg-muted rounded-md"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
              >
                {event ? '수정' : '저장'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;