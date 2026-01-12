export interface Database {
	public: {
		Tables: {
			article_titles: {
				Row: {
					id: string;
					title: string;
					description: string;
					category: string;
					created_at: string;
					is_generated: boolean;
				};
				Insert: {
					id?: string;
					title: string;
					description: string;
					category: string;
					created_at?: string;
					is_generated?: boolean;
				};
				Update: {
					id?: string;
					title?: string;
					description?: string;
					category?: string;
					created_at?: string;
					is_generated?: boolean;
				};
			};
			articles: {
				Row: {
					id: string;
					title_id: string;
					content: string;
					generated_at: string;
				};
				Insert: {
					id?: string;
					title_id: string;
					content: string;
					generated_at?: string;
				};
				Update: {
					id?: string;
					title_id?: string;
					content?: string;
					generated_at?: string;
				};
			};
		};
	};
}
